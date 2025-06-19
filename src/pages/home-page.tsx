import React from 'react';
import { Link } from 'react-router-dom';

export const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            TaskVision
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Organize your tasks with the MIT/LIT system. Focus on what matters most with intelligent task prioritization and fuzzy search.
          </p>
          
          <div className="flex justify-center space-x-6 mb-16">
            <Link
              to="/tasks"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              View Tasks
            </Link>
            <Link
              to="/dashboard"
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-8 rounded-lg transition-colors text-lg"
            >
              Dashboard
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-red-400 text-3xl mb-4">🎯</div>
              <h3 className="text-xl font-semibold mb-3">MIT Tasks</h3>
              <p className="text-gray-400">
                Most Important Tasks - Focus on up to 3 critical tasks that must be completed today
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-blue-400 text-3xl mb-4">📋</div>
              <h3 className="text-xl font-semibold mb-3">LIT Tasks</h3>
              <p className="text-gray-400">
                Less Important Tasks - Everything else that needs to be done, organized by priority
              </p>
            </div>
            
            <div className="bg-gray-800 p-6 rounded-lg">
              <div className="text-green-400 text-3xl mb-4">🔍</div>
              <h3 className="text-xl font-semibold mb-3">Smart Search</h3>
              <p className="text-gray-400">
                Find tasks instantly with fuzzy search across titles, descriptions, and tags
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="text-gray-400">
              Get started by <Link to="/tasks" className="text-blue-400 hover:text-blue-300 underline">managing your tasks</Link> or explore the <Link to="/dashboard" className="text-blue-400 hover:text-blue-300 underline">dashboard</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
