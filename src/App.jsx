import React, { useState, useRef, useEffect } from 'react'
import { Clock, Plus, Trash2, Edit } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'

function App() {
  const [entries, setEntries] = useState([])
  const [activities, setActivities] = useState(['Calls', 'Emails', 'Inspiration', 'Project X'])
  const [newActivity, setNewActivity] = useState('')
  const [currentEntry, setCurrentEntry] = useState({
    description: '',
    activity: activities[0],
    startTime: null,
    endTime: null,
  })
  const [isTracking, setIsTracking] = useState(false)
  const [dailyHours, setDailyHours] = useState(8)
  const [editingEntry, setEditingEntry] = useState(null)
  const descriptionInputRef = useRef(null)

  useEffect(() => {
    // Update the pie chart data whenever the entries change
    setChartData(calculateTimePercentages())
  }, [entries, dailyHours])

  const [chartData, setChartData] = useState([
    { id: 'Calls', label: 'Calls', value: 0 },
    { id: 'Emails', label: 'Emails', value: 0 },
    { id: 'Inspiration', label: 'Inspiration', value: 0 },
    { id: 'Project X', label: 'Project X', value: 0 },
  ])

  const startTracking = () => {
    setCurrentEntry({
      ...currentEntry,
      startTime: new Date(),
    })
    setIsTracking(true)
    if (descriptionInputRef.current) {
      descriptionInputRef.current.focus()
    }
  }

  const stopTracking = () => {
    const updatedEntry = {
      ...currentEntry,
      endTime: new Date(),
      id: Date.now(),
    }

    setEntries([...entries, updatedEntry])
    setIsTracking(false)

    setCurrentEntry({
      description: '',
      activity: activities[0],
      startTime: null,
      endTime: null,
    })
  }

  const addActivity = () => {
    if (newActivity.trim() && !activities.includes(newActivity.trim())) {
      setActivities([...activities, newActivity.trim()])
      setNewActivity('')
    }
  }

  const calculateTimePercentages = () => {
    const minutesInDailyHours = dailyHours * 60

    return activities.map(activity => ({
      id: activity,
      label: activity,
      value:
        (entries
          .filter(entry => entry.activity === activity)
          .reduce((total, entry) => {
            return total + (entry.endTime - entry.startTime) / 60000
          }, 0) /
          minutesInDailyHours) *
        100,
    }))
  }

  const updateEntry = updatedEntry => {
    setEntries(entries.map(entry => (entry.id === updatedEntry.id ? updatedEntry : entry)))
    setEditingEntry(null)
  }

  const handleBlur = () => {
    if (editingEntry) {
      updateEntry(editingEntry)
    }
    setEditingEntry(null)
  }

  const renderTimeBreakdown = () => {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <h3 className="text-lg font-bold mb-4">Time Breakdown</h3>
        <div className="flex justify-between items-center mb-4">
          <label htmlFor="daily-hours" className="font-medium">
            Daily Hours:
          </label>
          <input
            id="daily-hours"
            type="number"
            min="1"
            max="24"
            value={dailyHours}
            onChange={e => setDailyHours(parseInt(e.target.value))}
            className="p-2 border rounded w-20"
          />
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="label"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={({ value }) => `${value.toFixed(1)}%`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColorForActivity(entry.id)} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="flex justify-center mt-4 text-sm text-gray-500">
          Total:{' '}
          {entries
            .reduce((total, entry) => {
              return total + (entry.endTime - entry.startTime) / 60000
            }, 0)
            .toFixed(1)}{' '}
          mins
        </div>
      </div>
    )
  }

  const renderEntryEditor = entry => {
    return (
      <div className="flex space-x-4" onBlur={handleBlur}>
        <select
          value={entry.activity}
          onChange={e =>
            setEditingEntry({
              ...entry,
              activity: e.target.value,
            })
          }
          className="flex-grow p-2 border rounded"
        >
          {activities.map(activity => (
            <option key={activity} value={activity}>
              {activity}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="Description"
          value={entry.description}
          onChange={e =>
            setEditingEntry({
              ...entry,
              description: e.target.value,
            })
          }
          className="flex-grow p-2 border rounded"
        />

        <input
          type="time"
          value={entry.startTime.toTimeString().slice(0, 5)}
          onChange={e => {
            const [hours, minutes] = e.target.value.split(':')
            const newStartTime = new Date(entry.startTime)
            newStartTime.setHours(parseInt(hours), parseInt(minutes))
            setEditingEntry({ ...entry, startTime: newStartTime })
          }}
          className="p-2 border rounded"
        />

        <input
          type="time"
          value={entry.endTime.toTimeString().slice(0, 5)}
          onChange={e => {
            const [hours, minutes] = e.target.value.split(':')
            const newEndTime = new Date(entry.endTime)
            newEndTime.setHours(parseInt(hours), parseInt(minutes))
            setEditingEntry({ ...entry, endTime: newEndTime })
          }}
          className="p-2 border rounded"
        />
      </div>
    )
  }

  const formatTimeDuration = (startTime, endTime) => {
    const duration = endTime - startTime
    const hours = Math.floor(duration / 3600000)
    const minutes = Math.floor((duration % 3600000) / 60000)
    const seconds = Math.floor((duration % 60000) / 1000)
    return `${hours}h ${minutes}min ${seconds}sec`
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-lg rounded-xl">
      <h1 className="text-2xl font-bold mb-6 flex items-center">
        <Clock className="mr-2" /> Time Tracker
      </h1>

      {/* Activity Management */}
      <div className="mb-4 flex space-x-2">
        <input
          type="text"
          value={newActivity}
          onChange={e => setNewActivity(e.target.value)}
          placeholder="Add new activity"
          className="flex-grow p-2 border rounded"
        />
        <button onClick={addActivity} className="bg-green-500 text-white p-2 rounded flex items-center">
          <Plus className="mr-1" /> Add
        </button>
      </div>

      {/* Time Entry Section */}
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <select
            value={currentEntry.activity}
            onChange={e =>
              setCurrentEntry({
                ...currentEntry,
                activity: e.target.value,
              })
            }
            className="flex-grow p-2 border rounded"
          >
            {activities.map(activity => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </select>

          <div className="flex-grow relative">
            <input
              ref={descriptionInputRef}
              type="text"
              placeholder="What are you working on?"
              value={currentEntry.description}
              onChange={e =>
                setCurrentEntry({
                  ...currentEntry,
                  description: e.target.value,
                })
              }
              className="w-full p-2 border rounded"
            />
          </div>
        </div>

        <div className="flex space-x-4">
          {!isTracking ? (
            <button
              onClick={startTracking}
              className="flex-grow bg-green-500 text-white p-3 rounded flex items-center justify-center"
            >
              <Clock className="mr-2" /> Start Tracking
            </button>
          ) : (
            <button
              onClick={stopTracking}
              className="flex-grow bg-red-500 text-white p-3 rounded flex items-center justify-center"
            >
              <Clock className="mr-2" /> Stop Tracking
            </button>
          )}
        </div>
      </div>

      {/* Time Breakdown Section */}
      {renderTimeBreakdown()}

      {/* Entries List */}
      <div className="mt-6">
        <h3 className="text-lg font-bold mb-4">Recent Entries</h3>
        {entries.map(entry => (
          <div key={entry.id} className="bg-gray-50 p-3 rounded mb-2">
            {editingEntry && editingEntry.id === entry.id ? (
              renderEntryEditor(entry)
            ) : (
              <div className="flex justify-between items-center">
                <div>
                  <span
                    className="font-medium mr-2"
                    style={{
                      color: getColorForActivity(entry.activity),
                    }}
                  >
                    {entry.activity}
                  </span>
                  {entry.description}
                  <div className="text-sm text-gray-500">
                    {entry.startTime.toLocaleTimeString()} - {entry.endTime.toLocaleTimeString()}
                    <span className="ml-2">({formatTimeDuration(entry.startTime, entry.endTime)})</span>
                    <span className="ml-2">
                      ({(((entry.endTime - entry.startTime) / 60000 / (dailyHours * 60)) * 100).toFixed(1)}%)
                    </span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setEditingEntry(entry)}
                    className="text-blue-500 hover:bg-blue-100 p-2 rounded"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => setEntries(entries.filter(e => e.id !== entry.id))}
                    className="text-red-500 hover:bg-red-100 p-2 rounded"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

const getColorForActivity = activity => {
  const hashCode = activity.split('').reduce((hash, char) => {
    return char.charCodeAt(0) + ((hash << 5) - hash)
  }, 0)

  const color = (hashCode & 0x00ffffff).toString(16).toUpperCase()
  return `#${color.padStart(6, '0')}`
}

export default App
