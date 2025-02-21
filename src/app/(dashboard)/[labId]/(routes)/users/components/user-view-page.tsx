"use client"

import React from "react"
import { motion } from 'framer-motion'
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { ActiveDeviceUser, DeviceUser, YearLevel } from "@prisma/client"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserPlus2, Rainbow, Mail, Phone, BookOpen, GraduationCap, Search, FileSpreadsheet, Activity } from "lucide-react"
import * as XLSX from 'xlsx'
import { Separator } from "@/components/ui/separator"

interface UserViewPageProps {
  data: (DeviceUser & {
    activeDevices: ActiveDeviceUser[] | null
  })[]
}

export const UserViewPage: React.FC<UserViewPageProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = React.useState("");
  const [courseFilter, setCourseFilter] = React.useState<string>("ALL");
  const [roleFilter, setRoleFilter] = React.useState<string>("ALL");
  const [statusFilter, setStatusFilter] = React.useState<string>("ALL");
  const [yearLevelFilter, setYearLevelFilter] = React.useState<string>("ALL");

  const getYearLevelEnum = (year: string) => {
    const map: { [key: string]: YearLevel } = {
      "1": "FIRST",
      "2": "SECOND",
      "3": "THIRD",
      "4": "FOURTH"
    };
    return map[year];
  };

  const filteredUsers = data.filter((user) => {
    const searchTerm = searchQuery.toLowerCase();
    const matchesSearch =
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.schoolId.toLowerCase().includes(searchTerm);

    const matchesCourse = courseFilter === "ALL" || user.course === courseFilter;
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    const matchesYearLevel = yearLevelFilter === "ALL" || 
      (user.role === "STUDENT" && user.yearLevel === getYearLevelEnum(yearLevelFilter));
    const matchesStatus = statusFilter === "ALL" ||
      (statusFilter === "ONLINE" && user.activeDevices && user.activeDevices.length > 0) ||
      (statusFilter === "OFFLINE" && (!user.activeDevices || user.activeDevices.length === 0));

    return matchesSearch && matchesCourse && matchesRole && matchesStatus && matchesYearLevel;
  });

  const handleExportToExcel = () => {
    const exportData = filteredUsers.map(user => ({
      'School ID': user.schoolId,
      'First Name': user.firstName,
      'Last Name': user.lastName,
      'Email': user.email,
      'Contact Number': user.contactNo,
      'Course': user.course,
      'Year Level': user.yearLevel,
      'Role': user.role,
      'Status': user.activeDevices && user.activeDevices.length > 0 ? 'Online' : 'Offline'
    }));

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Users');

    // Generate timestamp for filename
    const timestamp = new Date().toISOString().split('T')[0];

    // Trigger download
    XLSX.writeFile(wb, `device-users-${timestamp}.xlsx`);
  };

  const handleViewActivityLogs = (userId: string) => {
    router.push(`/${params.labId}/users/${userId}/logs`)
  };

  const handlePreRegister = () => {
    router.push(`/${params.labId}/users/register`)
  }

  const getYearLevelDisplay = (yearLevel: YearLevel) => {
    const map: { [key in YearLevel]: string } = {
      FIRST: "1st",
      SECOND: "2nd",
      THIRD: "3rd",
      FOURTH: "4th"
    };
    return map[yearLevel];
  };

  return (
    <div className="space-y-4">
      <Card className="bg-white dark:bg-gray-800">
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ONLINE">Online</SelectItem>
                  <SelectItem value="OFFLINE">Offline</SelectItem>
                </SelectContent>
              </Select>

              <Select value={courseFilter} onValueChange={setCourseFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Course" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Courses</SelectItem>
                  <SelectItem value="BSA">BSA</SelectItem>
                  <SelectItem value="BSCRIM">BSCRIM</SelectItem>
                  <SelectItem value="BEED">BEED</SelectItem>
                  <SelectItem value="BSBA">BSBA</SelectItem>
                  <SelectItem value="BSCS">BSCS</SelectItem>
                  <SelectItem value="BSHM">BSHM</SelectItem>
                  <SelectItem value="BSTM">BSTM</SelectItem>
                </SelectContent>
              </Select>

              <Select value={yearLevelFilter} onValueChange={setYearLevelFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Years</SelectItem>
                  <SelectItem value="1">1st Year</SelectItem>
                  <SelectItem value="2">2nd Year</SelectItem>
                  <SelectItem value="3">3rd Year</SelectItem>
                  <SelectItem value="4">4th Year</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Roles</SelectItem>
                  <SelectItem value="STUDENT">Student</SelectItem>
                  <SelectItem value="TEACHER">Teacher</SelectItem>
                </SelectContent>
              </Select>

              <div className="relative w-full">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search users..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex justify-end">
              <Button
                onClick={handleExportToExcel}
                className="bg-green-600 hover:bg-green-700"
                size="sm"
              >
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Export to Excel
              </Button>
            </div>
          </div>
          <Separator className="mt-4" />
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
            {filteredUsers.map((user) => (
              <motion.div
                key={user.id}
                whileHover={{ scale: 1.02 }}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 space-y-3 border"
              >
                <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
                  {!user.email || !user.contactNo ? (
                    <Badge
                      variant="destructive"
                      className="bg-red-500/10 text-red-500 hover:bg-red-500/20"
                    >
                      Not Activated
                    </Badge>
                  ) : (
                    <Badge
                      variant={user.activeDevices && user.activeDevices.length > 0 ? "success" : "secondary"}
                      className={`${user.activeDevices && user.activeDevices.length > 0
                        ? "bg-green-500/10 text-green-500 hover:bg-green-500/20"
                        : "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20"
                        }`}
                    >
                      {user.activeDevices && user.activeDevices.length > 0 ? "Online" : "Offline"}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-[#C9121F] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-base sm:text-lg font-semibold">
                      {user.firstName[0]}{user.lastName[0]}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold truncate">{user.firstName} {user.lastName}</h3>
                    <p className="text-sm text-gray-500 truncate">{user.schoolId}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-xs sm:text-sm">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{user.email || "Not set"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{user.contactNo || "Not set"}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <BookOpen className="h-4 w-4 text-gray-500 flex-shrink-0" />
                    <span className="truncate">{user.course}</span>
                  </div>
                  {user.role === "STUDENT" && (
                    <div className="flex items-center space-x-2">
                      <GraduationCap className="h-4 w-4 text-gray-500 flex-shrink-0" />
                      <span className="truncate">{getYearLevelDisplay(user.yearLevel)} Year</span>
                    </div>
                  )}
                </div>
                
                <div className="pt-2 mt-2 border-t">
                  <Button
                    onClick={() => handleViewActivityLogs(user.id)}
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={!user.email || !user.contactNo}
                  >
                    <Activity className="h-4 w-4 mr-2" />
                    {!user.email || !user.contactNo ? "Activation Required" : "View Activity Logs"}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}