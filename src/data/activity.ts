"use server"

import { db } from "@/lib/db"
import _ from 'underscore';
import { diffMinutes, formatDuration } from "@/lib/utils";
import { ActivityLogs } from "@prisma/client";

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
  timestamp: string; // Add timestamp
  subActivity: SubActivity[];
}

interface SubActivity {
  title: string;
  time: number;
  timestamp: string; // Add timestamp
}

const MAX_IDLE_MINUTES = 30; // Consider session broken if gap is more than 30 minutes

function calculateActivityDuration(currentTime: Date, nextTime: Date | null): number {
  if (!nextTime) {
    const now = new Date();
    const duration = Math.abs(diffMinutes(currentTime, now));
    return Math.min(duration, MAX_IDLE_MINUTES);
  }

  // Ensure we're calculating the absolute difference
  const duration = Math.abs(diffMinutes(currentTime, nextTime));
  return duration > MAX_IDLE_MINUTES ? MAX_IDLE_MINUTES : duration;
}

export async function getAllActivities(labId: string, userId: string, deviceId: string) {
  try {
    const activities = await db.activityLogs.findMany({
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
    const breakdown = await formatActivities(filteredActivities) // Added line
    console.log("Activities by day:", breakdown) // Modified line
    return breakdown // Modified line
  } catch (error) {
    console.error("Error fetching activities by day:", error)
    return []
  }
}

export async function getEvents(labId: string, userId: string, deviceId: string) {
  const activities = await getAllActivities(labId, userId, deviceId);
  const events: Event[] = [];
  const dailyActivities = new Map<string, number>();

  // Sort activities by time
  const sortedActivities = _.sortBy(activities, (a) => new Date(a.time).getTime());

  sortedActivities.forEach((activity, index) => {
    const currentDate = new Date(activity.time);
    const dateKey = currentDate.toISOString().slice(0, 10);
    const nextActivity = sortedActivities[index + 1];
    
    const duration = calculateActivityDuration(
      currentDate,
      nextActivity ? new Date(nextActivity.time) : null
    );

    // Accumulate time for each date
    dailyActivities.set(
      dateKey, 
      (dailyActivities.get(dateKey) || 0) + duration
    );
  });

  // Create events from daily totals
  dailyActivities.forEach((totalMinutes, date) => {
    events.push({
      title: `${formatDuration(totalMinutes)} recorded`,
      start: date,
      end: date,
      allDay: true,
      url: `day.html?date=${date}`,
      time: Math.round(totalMinutes)
    });
  });

  return Array.from(events).sort((a, b) => b.start.localeCompare(a.start));
}

export async function formatActivities(activities: ActivityLogs[]): Promise<Breakdown[]> {
  const breakdown: Breakdown[] = [];
  const activityMap = new Map<string, Breakdown>();

  // Sort activities by time to ensure correct sequence
  const sortedActivities = _.sortBy(activities, (a) => new Date(a.time).getTime());

  // Group activities by owner and calculate durations
  sortedActivities.forEach((activity, index) => {
    const currentTime = new Date(activity.time);
    // Use ISO string for timestamp
    const timestamp = currentTime.toISOString();
    
    const nextActivity = sortedActivities[index + 1];
    
    const duration = calculateActivityDuration(
      currentTime,
      nextActivity ? new Date(nextActivity.time) : null
    );

    const ownerKey = activity.owner;
    if (!activityMap.has(ownerKey)) {
      activityMap.set(ownerKey, {
        title: ownerKey,
        time: 0,
        timestamp: timestamp,
        subActivity: []
      });
    }

    const ownerActivity = activityMap.get(ownerKey)!;

    // Find or create sub-activity
    const existingSubActivity = ownerActivity.subActivity.find(
      sub => sub.title === activity.title
    );

    if (existingSubActivity) {
      existingSubActivity.time += duration;
      // Compare using numeric timestamps
      if (currentTime.getTime() < new Date(existingSubActivity.timestamp).getTime()) {
        existingSubActivity.timestamp = timestamp;
      }
    } else {
      ownerActivity.subActivity.push({
        title: activity.title,
        time: duration,
        timestamp: timestamp
      });
    }

    // Update total time for this owner
    ownerActivity.time = ownerActivity.subActivity.reduce(
      (total, sub) => total + sub.time, 
      0
    );
  });

  // Convert map to array and sort
  const result = Array.from(activityMap.values()).map(item => ({
    ...item,
    // Ensure time is the sum of sub-activities
    time: item.subActivity.reduce((total, sub) => total + sub.time, 0),
    // Sort sub-activities by time
    subActivity: _.sortBy(item.subActivity, 'time').reverse()
  }));

  // Round all times to nearest minute
  result.forEach(item => {
    item.time = Math.round(item.time);
    item.subActivity.forEach(sub => {
      sub.time = Math.round(sub.time);
    });
  });

  return _.sortBy(result, 'time').reverse();
}

export type { Event, Breakdown, SubActivity }