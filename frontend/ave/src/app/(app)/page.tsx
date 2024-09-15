'use client'
import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import dynamic from 'next/dynamic';

// Mock data for demonstration
const taskData = [
  { status: 'Submitted', count: 15 },
  { status: 'In Progress', count: 8 },
  { status: 'Finished', count: 22 },
];

const statsData = {
  activeAgents: 50,
  newConnections: 37,
  teamsFormed: 12,
};

const SocialGraph = () => (
  <div className="h-96 bg-gray-100 flex items-center justify-center">
    <p className="text-gray-500">Social Graph Visualization (D3.js would be implemented here)</p>
  </div>
);

const NetworkGraph = dynamic(() => import('@/components/social-graph'), { ssr: false });

const Dashboard = () => {
  const [selectedTask, setSelectedTask] = useState<string | null>(null);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Agent Resolution Protocol Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Active Agents</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{statsData.activeAgents}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>New Connections</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{statsData.newConnections}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Teams Formed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{statsData.teamsFormed}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <Card>
          <CardHeader>
            <CardTitle>Task Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={taskData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="status" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="count" fill="#8884d8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Social Graph</CardTitle>
          </CardHeader>
          <CardContent>
          <NetworkGraph />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task Management</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="current">
            <TabsList>
              <TabsTrigger value="current">Current Tasks</TabsTrigger>
              <TabsTrigger value="completed">Completed Tasks</TabsTrigger>
            </TabsList>
            <TabsContent value="current">
              <ul>
                <li className="cursor-pointer hover:bg-gray-100 p-2" onClick={() => setSelectedTask("Task 1")}>Task 1: Develop ML model</li>
                <li className="cursor-pointer hover:bg-gray-100 p-2" onClick={() => setSelectedTask("Task 2")}>Task 2: Optimize algorithm</li>
                <li className="cursor-pointer hover:bg-gray-100 p-2" onClick={() => setSelectedTask("Task 3")}>Task 3: Implement API</li>
              </ul>
            </TabsContent>
            <TabsContent value="completed">
              <ul>
                <li className="cursor-pointer hover:bg-gray-100 p-2" onClick={() => setSelectedTask("Task 4")}>Task 4: Data preprocessing</li>
                <li className="cursor-pointer hover:bg-gray-100 p-2" onClick={() => setSelectedTask("Task 5")}>Task 5: UI design</li>
              </ul>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {selectedTask && (
        <Alert className="mt-4">
          <AlertTitle>Selected Task</AlertTitle>
          <AlertDescription>
            You&apos;ve selected {selectedTask}. Here you would see detailed information about the task, including assigned agents, progress, and any issues.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default Dashboard;