"use client";

import { ActiveDeviceUser, Device, DeviceUser } from "@prisma/client";
import { motion, AnimatePresence } from 'framer-motion';
import { Frown, Monitor, Power } from "lucide-react";  // Update imports
import { DeviceArtwork } from "./device_artwork";


interface DeviceGridProps {
  activeDevices: (ActiveDeviceUser & { device: Device, user: DeviceUser })[];
  inactiveDevices: Device[];  // Fix type
  onRefresh: () => void;
}

export const DeviceGrid: React.FC<DeviceGridProps> = ({
  activeDevices,
  inactiveDevices,
  onRefresh,
}) => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <div className="space-y-8">
      {/* Active Devices Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Monitor className="h-5 w-5 text-[#C9121F]" /> {/* Changed from Heart */}
          <h2 className="text-lg font-semibold">Active Devices ({activeDevices.length})</h2>
        </div>
        <motion.div
          className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <AnimatePresence>
            {activeDevices.length === 0 ? (
              <div className="col-span-full">
                <EmptyState message="No Active Devices" />
              </div>
            ) : (
              activeDevices.map(data => (
                <motion.div
                  key={data.id}
                  variants={itemVariants}
                  className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-xl"
                >
                  <DeviceArtwork
                  
                    device={data.device}
                    user={data.user}
                    className="w-full h-full"
                    aspectRatio="portrait"
                    width={250}
                    height={330}
                    onChanged={onRefresh}
                   
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* Inactive Devices Section */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Power className="h-5 w-5 text-[#C9121F]" /> {/* Changed from Sparkles */}
          <h2 className="text-lg font-semibold">Inactive Devices ({inactiveDevices.length})</h2>
        </div>
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inactiveDevices.length === 0 ? (
            <div className="col-span-full">
              <EmptyState message="No Inactive Devices" />
            </div>
          ) : (
            inactiveDevices.map((inactive) => (
              <motion.div
                key={inactive.id}
                className="transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg rounded-xl"
              >
                <DeviceArtwork
                  key={inactive.id}
                
                  device={inactive}
                  className="w-full h-full"
                  aspectRatio="square"
                  width={150}
                  height={150}
                 
                  onChanged={onRefresh}
                />
              </motion.div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

const EmptyState = ({ message }: { message: string }) => {
  return (
    <motion.div
      className="flex flex-col items-center justify-center w-full py-12 bg-accent/50 rounded-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Frown className="h-16 w-16 text-[#C9121F] mb-4 animate-bounce" />
      <p className="text-lg font-semibold text-black dark:text-white">{message}</p>
      <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 text-center">
        It&apos;s quiet here... too quiet.
      </p>
    </motion.div>
  );
};
