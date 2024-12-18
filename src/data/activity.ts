"use server"

import { db } from "@/lib/db"
import _ from 'underscore';
import { DeviceUserActivity } from "@prisma/client";
import { diffMinutes } from "@/lib/utils";

interface Event {
  title: string;
  start: string;
  end: string;
  allDay: boolean;
  url: string;
  time: number;
}

interface Breakdown {
  title: string;
  time: number;
  subActivity: SubActivity[];
}

interface SubActivity {
  title: string;
  time: number;
}

export async function getAllActivities(labId: string, userId: string, deviceId: string) {
  try {
    const activities = await db.deviceUserActivity.findMany({
      where: {
        labId,
        userId,
        deviceId
      },
    })
    console.log("All activities:", activities)
    return activities
  } catch (error) {
    console.error("Error fetching all activities:", error)
    return []
  }
}

export async function getActivitiesByDay(labId: string, userId: string, deviceId: string, day: string) {
  try {
    const activities = await getAllActivities(labId, userId, deviceId)
    const filteredActivities = activities.filter(activity =>
      new Date(activity.time).toISOString().slice(0, 10) === day
    )
    console.log("Activities by day:", filteredActivities)
    return filteredActivities
  } catch (error) {
    console.error("Error fetching activities by day:", error)
    return []
  }
}

export async function getEvents(labId: string, userId: string, deviceId: string) {
  const activities = await getAllActivities(labId, userId, deviceId);
  const events: Event[] = [];

  for (let i = 0; i < activities.length; i++) {
    if (activities[i + 1]) {
      const thisDate = new Date(activities[i].time).toISOString().slice(0, 10);
      const nextDate = new Date(activities[i + 1].time).toISOString().slice(0, 10);
      const found = events.find(({ start }) => start === thisDate);

      const nextTime = thisDate === nextDate
        ? new Date(activities[i + 1].time)
        : new Date(`${thisDate}T23:59:59`);

      const time = diffMinutes(new Date(activities[i].time), nextTime);
      const hours = Math.floor(time / 60);
      const minutes = time % 60;

      if (found) {
        found.time += time;
        found.title = `${Math.floor(found.time / 60)} Hrs ${found.time % 60} Min recorded`;
      } else {
        events.push({
          title: `${hours} Hrs ${minutes} Min recorded`,
          start: thisDate,
          end: thisDate,
          allDay: true,
          url: `day.html?date=${thisDate}`,
          time: time
        });
      }
    }
  }
  return events;
}


export async function formatActivities(activities: DeviceUserActivity[]): Promise<Breakdown[]> {
  const breakdown: Breakdown[] = [];

  for (let i = 0; i < activities.length; i++) {
    const currentActivity = activities[i];
    const nextActivity = activities[i + 1];
    const time = nextActivity
      ? diffMinutes(new Date(currentActivity.time), new Date(nextActivity.time))
      : diffMinutes(new Date(currentActivity.time), new Date());

    const found = breakdown.find(({ title }) => title === currentActivity.owner);

    if (found) {
      found.time += time;
      const subActivityFound = found.subActivity.find(({ title }) => title === currentActivity.title);

      if (subActivityFound) {
        subActivityFound.time += time;
      } else {
        found.subActivity.push({ title: currentActivity.title, time: time });
      }
    } else {
      breakdown.push({
        title: currentActivity.owner,
        time: time,
        subActivity: [{ title: currentActivity.title, time: time }]
      });
    }
  }

  breakdown.forEach(item => {
    item.subActivity = _.sortBy(item.subActivity, 'time').reverse();
  });

  return _.sortBy(breakdown, 'time').reverse();
}


export type { Event, Breakdown, SubActivity }