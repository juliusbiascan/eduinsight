"use client"

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts"
import { motion } from "framer-motion"
import { useTheme } from "next-themes"

interface OverviewProps {
  data: any[];
};

export const Overview: React.FC<OverviewProps> = ({ data }) => {
  const { theme } = useTheme()
  const isDarkMode = theme === 'dark'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="p-4 bg-[#EAEAEB] dark:bg-[#1A1617] rounded-lg shadow-md"
    >
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDarkMode ? "#333333" : "#e5e5e5"}
            vertical={false}
          />
          <XAxis
            dataKey="name"
            stroke={isDarkMode ? "#ffffff" : "#1A1617"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke={isDarkMode ? "#ffffff" : "#1A1617"}
            fontSize={12}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip
            contentStyle={{
              background: isDarkMode ? '#1A1617' : '#EAEAEB',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              color: isDarkMode ? '#ffffff' : '#1A1617'
            }}
            cursor={{ fill: isDarkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)' }}
          />
          <Bar
            dataKey="total"
            fill="url(#colorGradient)"
            radius={[4, 4, 0, 0]}
          >
            {data.map((entry, index) => (
              <motion.rect
                key={`bar-${index}`}
                whileHover={{ scale: 1.03 }}
                transition={{ type: "spring", stiffness: 300 }}
              />
            ))}
          </Bar>
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9121F" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#C9121F" stopOpacity={0.3} />
            </linearGradient>
          </defs>
        </BarChart>
      </ResponsiveContainer>
    </motion.div>
  )
}