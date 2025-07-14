import React, { useState, useEffect } from 'react';
import { RefreshCw, Lock, Unlock, Download, Upload, Plus, Trash2 } from 'lucide-react';

const WorkScheduler = () => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const timeSlots = ['2:00-4:30', '4:30-6:00', '6:00-7:30', '7:30-10:30'];
  const roles = ['Auditing', 'Packing1', 'Packing2', 'Shipping'];
  
  // Initialize workers with scores and availability
  const [workers, setWorkers] = useState([
    { 
      name: 'Erfan', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '10:30' }
    },
    { 
      name: 'Emmanuel', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '10:30' }
    },
    { 
      name: 'Jethro', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '6:00' }
    },
    { 
      name: 'Ruchelle', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '10:30' }
    },
    { 
      name: 'Stephanie', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '7:30' }
    },
    { 
      name: 'Amy', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '10:30' }
    },
    { 
      name: 'Girija', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '4:00' }
    },
    { 
      name: 'Rashi', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '10:30' }
    },
    { 
      name: 'Lucy', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '10:30' }
    },
    { 
      name: 'Mathew', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '10:30' }
    },
    { 
      name: 'Hardik', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '10:30' }
    },
    { 
      name: 'Mathew', 
      scores: { auditing: 4, packing: 4, shipping: 4 },
      availability: { end: '10:30' }
    }
  ]);

  // State for UI
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAddWorker, setShowAddWorker] = useState(false);
  const [newWorkerName, setNewWorkerName] = useState('');

  // Schedule state
  const initSchedule = () => {
    return days.map(() => 
      timeSlots.map(() => 
        roles.map(() => ({ worker: null, locked: false }))
      )
    );
  };

  const [schedule, setSchedule] = useState(initSchedule);

  // Check if worker is available for a time slot
  const isWorkerAvailable = (worker, timeSlot) => {
    const slotStart = timeSlot.split('-')[0];
    const workerEndTime = worker.availability.end;
    
    const timeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };
    
    return timeToMinutes(slotStart) < timeToMinutes(workerEndTime);
  };

  // Generate schedule with animation
  const generateSchedule = async () => {
    setIsGenerating(true);
    
    // Small delay for animation effect
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Create new schedule preserving only locked positions
    const newSchedule = schedule.map((day, d) => 
      day.map((timeSlot, t) => 
        timeSlot.map((role, r) => {
          if (schedule[d][t][r].locked) {
            return { ...schedule[d][t][r] }; // Keep locked positions
          }
          return { worker: null, locked: false }; // Clear non-locked positions
        })
      )
    );
    
    const workerUsage = {};
    
    // Initialize worker usage tracking
    workers.forEach(w => {
      workerUsage[w.name] = {
        total: 0,
        roles: { auditing: 0, packing: 0, shipping: 0 },
        lastRole: null,
        lastDay: -1
      };
    });

    // Generate schedule
    for (let d = 0; d < days.length; d++) {
      for (let t = 0; t < timeSlots.length; t++) {
        const availableWorkers = workers.filter(w => 
          isWorkerAvailable(w, timeSlots[t])
        );
        
        // Remove workers already assigned in this time slot
        const assignedInSlot = new Set();
        for (let r = 0; r < roles.length; r++) {
          if (newSchedule[d][t][r].locked && newSchedule[d][t][r].worker) {
            assignedInSlot.add(newSchedule[d][t][r].worker);
          }
        }
        
        // Assign workers to roles
        for (let r = 0; r < roles.length; r++) {
          if (newSchedule[d][t][r].locked) continue;

          const roleType = roles[r].includes('Packing') ? 'packing' : 
                          roles[r].toLowerCase();

          // Filter out already assigned workers
          const unassignedWorkers = availableWorkers.filter(w => 
            !assignedInSlot.has(w.name)
          );

          // Score each available worker
          const scoredWorkers = unassignedWorkers.map(worker => {
            let score = worker.scores[roleType] || 0;
            
            // Various penalties and bonuses
            score -= workerUsage[worker.name].total * 0.1;
            if (workerUsage[worker.name].lastRole === roleType) {
              score -= 1;
            }
            score -= workerUsage[worker.name].roles[roleType] * 0.2;
            
            // Increased randomness for more variation between shuffles
            score += Math.random() * 1.5;
            
            return { worker, score };
          });

          scoredWorkers.sort((a, b) => b.score - a.score);
          
          if (scoredWorkers.length > 0) {
            const selected = scoredWorkers[0].worker;
            newSchedule[d][t][r] = { 
              worker: selected.name, 
              locked: false
            };
            
            assignedInSlot.add(selected.name);
            workerUsage[selected.name].total++;
            workerUsage[selected.name].roles[roleType]++;
            workerUsage[selected.name].lastRole = roleType;
          } else {
            newSchedule[d][t][r] = { worker: null, locked: false };
          }
        }
      }
    }
    
    setSchedule(newSchedule);
    setTimeout(() => setIsGenerating(false), 500);
  };

  // Other functions
  const toggleLock = (day, time, role) => {
    const newSchedule = [...schedule];
    newSchedule[day][time][role].locked = !newSchedule[day][time][role].locked;
    setSchedule(newSchedule);
  };

  const setWorker = (day, time, role, workerName) => {
    const newSchedule = [...schedule];
    newSchedule[day][time][role] = { 
      worker: workerName || null, 
      locked: workerName ? true : false
    };
    setSchedule(newSchedule);
  };

  const addWorker = () => {
    if (newWorkerName.trim()) {
      setWorkers([...workers, {
        name: newWorkerName.trim(),
        scores: { auditing: 2, packing: 2, shipping: 2 },
        availability: { end: '10:30' }
      }]);
      setNewWorkerName('');
      setShowAddWorker(false);
    }
  };

  const removeWorker = (idx) => {
    setWorkers(workers.filter((_, i) => i !== idx));
  };

  const updateWorkerScore = (workerName, role, score) => {
    setWorkers(workers.map(w => 
      w.name === workerName 
        ? { ...w, scores: { ...w.scores, [role]: parseInt(score) } }
        : w
    ));
  };

  const updateWorkerAvailability = (workerName, endTime) => {
    setWorkers(workers.map(w => 
      w.name === workerName 
        ? { ...w, availability: { ...w.availability, end: endTime } }
        : w
    ));
  };

  const exportSchedule = () => {
    const data = {
      workers,
      schedule,
      date: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `schedule-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  const importSchedule = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          if (data.workers) setWorkers(data.workers);
          if (data.schedule) setSchedule(data.schedule);
        } catch (err) {
          console.error('Error importing schedule:', err);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">
          Work Schedule Generator
        </h1>
        
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all hover:shadow-xl">
          <div className="flex flex-wrap gap-4">
            <button
              onClick={generateSchedule}
              disabled={isGenerating}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg hover:from-blue-600 hover:to-blue-700 transform transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
            >
              <RefreshCw size={18} className={isGenerating ? 'animate-spin' : ''} />
              {isGenerating ? 'Generating...' : 'Generate/Shuffle Schedule'}
            </button>
            <button
              onClick={() => setShowAddWorker(true)}
              className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg hover:from-green-600 hover:to-green-700 transform transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <Plus className="inline mr-2" size={18} />
              Add Worker
            </button>
            <button
              onClick={exportSchedule}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transform transition-all hover:scale-105 active:scale-95 shadow-md"
            >
              <Download size={18} />
              Export
            </button>
            <label className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg hover:from-purple-600 hover:to-purple-700 transform transition-all hover:scale-105 active:scale-95 cursor-pointer shadow-md">
              <Upload size={18} />
              Import
              <input type="file" onChange={importSchedule} className="hidden" accept=".json" />
            </label>
          </div>
        </div>

        {/* Add Worker Modal */}
        {showAddWorker && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fadeIn">
            <div className="bg-white rounded-xl p-6 shadow-2xl transform animate-slideIn">
              <h3 className="text-xl font-semibold mb-4">Add New Worker</h3>
              <input
                type="text"
                value={newWorkerName}
                onChange={(e) => setNewWorkerName(e.target.value)}
                placeholder="Worker name"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && addWorker()}
                autoFocus
              />
              <div className="flex gap-3 mt-4">
                <button
                  onClick={addWorker}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  Add
                </button>
                <button
                  onClick={() => {
                    setShowAddWorker(false);
                    setNewWorkerName('');
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Worker Scores */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6 transform transition-all hover:shadow-xl">
          <h2 className="text-2xl font-semibold mb-4 text-gray-800">Worker Skills & Availability</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left p-3 font-semibold">Worker</th>
                  <th className="text-center p-3 font-semibold">Auditing</th>
                  <th className="text-center p-3 font-semibold">Packing</th>
                  <th className="text-center p-3 font-semibold">Shipping</th>
                  <th className="text-center p-3 font-semibold">Available Until</th>
                  <th className="text-center p-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workers.map((worker, idx) => (
                  <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-medium">{worker.name}</td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="4"
                        value={worker.scores.auditing}
                        onChange={(e) => updateWorkerScore(worker.name, 'auditing', e.target.value)}
                        className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="4"
                        value={worker.scores.packing}
                        onChange={(e) => updateWorkerScore(worker.name, 'packing', e.target.value)}
                        className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <input
                        type="number"
                        min="0"
                        max="4"
                        value={worker.scores.shipping}
                        onChange={(e) => updateWorkerScore(worker.name, 'shipping', e.target.value)}
                        className="w-16 text-center border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      />
                    </td>
                    <td className="p-3 text-center">
                      <select
                        value={worker.availability.end}
                        onChange={(e) => updateWorkerAvailability(worker.name, e.target.value)}
                        className="border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      >
                        <option value="4:30">4:30 PM</option>
                        <option value="6:00">6:00 PM</option>
                        <option value="7:30">7:30 PM</option>
                        <option value="10:30">10:30 PM</option>
                      </select>
                    </td>
                    <td className="p-3 text-center">
                      <button
                        onClick={() => removeWorker(idx)}
                        className="text-red-500 hover:text-red-700 transition-colors p-1 rounded hover:bg-red-50"
                      >
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Schedule Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
          {days.map((day, dayIdx) => (
            <div 
              key={day} 
              className={`bg-white rounded-xl shadow-lg p-4 transform transition-all hover:shadow-xl ${
                isGenerating ? 'opacity-50' : ''
              }`}
            >
              <h3 className="text-xl font-semibold mb-4 text-center text-gray-800">{day}</h3>
              <div className="space-y-3">
                {timeSlots.map((time, timeIdx) => (
                  <div 
                    key={time} 
                    className={`border border-gray-200 rounded-lg p-3 transition-all ${
                      isGenerating ? 'animate-pulse bg-gray-50' : 'hover:shadow-md'
                    }`}
                  >
                    <div className="font-medium text-sm mb-2 text-gray-700">{time}</div>
                    <div className="space-y-2">
                      {roles.map((role, roleIdx) => {
                        const slot = schedule[dayIdx][timeIdx][roleIdx];
                        
                        return (
                          <div key={role} className="flex items-center gap-2">
                            <span className="text-xs w-20 text-gray-600">{role}:</span>
                            <select
                              value={slot.worker || ''}
                              onChange={(e) => setWorker(dayIdx, timeIdx, roleIdx, e.target.value)}
                              className="flex-1 text-sm border border-gray-300 rounded-lg px-2 py-1 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                              disabled={isGenerating}
                            >
                              <option value="">-</option>
                              {workers
                                .filter(w => isWorkerAvailable(w, time))
                                .map(w => (
                                  <option key={w.name} value={w.name}>{w.name}</option>
                                ))}
                            </select>
                            <button
                              onClick={() => toggleLock(dayIdx, timeIdx, roleIdx)}
                              disabled={isGenerating}
                              className={`p-1.5 rounded-lg transition-all ${
                                slot.locked 
                                  ? 'text-red-500 hover:text-red-700 bg-red-50 hover:bg-red-100' 
                                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
                              }`}
                            >
                              {slot.locked ? <Lock size={14} /> : <Unlock size={14} />}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
      
      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(-20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }
        
        .animate-slideIn {
          animation: slideIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default WorkScheduler;
