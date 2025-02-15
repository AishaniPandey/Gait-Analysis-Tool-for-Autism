import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
const Meetings_inprogress = () => {
  const navigate = useNavigate();
  const user_name = localStorage.getItem('name');
  const [camps, setCamps] = useState([]);
  const [filteredMeetings, setFilteredMeetings] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
  });

  const [meetings, setMeetings] = useState([]);
  
  const fetchMeetings = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No token found');
        return;
      }
      const response = await axios.get('/api/auth/meetings');
      const doctorMeetings = response.data.filter(meeting => meeting.doctor === user_name);
      const filteredMeetings = [];
      for (const meeting of doctorMeetings) {
        if (meeting.status === "in_progress") {
          // Add directly to filtered camps if already in progress
          filteredMeetings.push(meeting);
        } else if (meeting.status === "scheduled") {
          const meetingDate = new Date(meeting.dateTime); // Convert dateTime to a Date object
          const now = new Date(); // Current date and time
  
          // Check if the upcoming camp's dateTime has passed
          if (meetingDate < now) {
            // Update the camp status to "in_progress"
            const data = {
              meetID: meeting.meetID,
              status: 'in_progress',
            };
            await axios.post('/api/auth/update_meeting_status', data);
          
            meeting.status = "in_progress";
            filteredMeetings.push(meeting);
          }
        }
      }
      setMeetings(filteredMeetings); 
      const response2 = await axios.get('/api/auth/camps');
      setCamps(response2.data);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  useEffect(() => {
    fetchMeetings();
  }, [user_name]);

  const filterMeetings = () => {
    let filtered = meetings.filter(
      (meeting) =>
        meeting.doctor === user_name && meeting.status === "in_progress"
    );

    // Filter by search term (meeting ID)
    if (searchTerm) {
      filtered = filtered.filter(meeting =>
        meeting.meetID.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by startDate if selected
    if (filters.startDate) {
      filtered = filtered.filter(
        (meeting) => new Date(meeting.dateTime) >= new Date(filters.startDate)
      );
    }

    // Filter by endDate if selected
    if (filters.endDate) {
      filtered = filtered.filter(
        (meeting) => new Date(meeting.dateTime) <= new Date(filters.endDate)
      );
    }

    setFilteredMeetings(filtered);
  };

  const handleRowClick = (meetingID) => {
    localStorage.setItem('meet-id', meetingID);
    navigate(`/meeting-details`);
  };

  const handleClearDates = () => {
    setFilters({
      startDate: '',
      endDate: '',
    });
  };

  useEffect(() => {
    if (meetings.length > 0) {
      filterMeetings();
    }
  }, [meetings, filters, searchTerm]);

  

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#fff' }}>
      {/* Sidebar */}
      <div
        style={{
          width: '250px',
          background: 'linear-gradient(to bottom, #9F69B8, #4D8BCC)',
          color: 'white',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          marginBottom: '30px' 
        }}>
          <i className="fa fa-user-circle" style={{ 
            marginRight: '10px', 
            fontSize: '24px' 
          }}></i>
          <span style={{ 
            fontWeight: 'bold', 
            fontSize: '20px' 
          }}>Doctor</span>
        </div>
        <div
          style={{ marginBottom: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/dashboard')}
        >
          <i className="fa fa-home" style={{ marginRight: '10px' }}></i> Home
        </div>
        <div
          style={{ marginBottom: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/profile')}
        >
          <i className="fa fa-user" style={{ marginRight: '10px' }}></i> Profile
        </div>
        <div
          style={{ marginBottom: '20px', cursor: 'pointer' }}
          onClick={() => navigate('/support')}
        >
          <i className="fa fa-question-circle" style={{ marginRight: '10px' }}></i> Support
        </div>
        <div
          style={{
            marginTop: 'auto',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
          }}
          onClick={() => {
            localStorage.clear();
            navigate('/login');
          }}
        >
          <i className="fa fa-sign-out-alt" style={{ marginRight: '10px' }}></i> Log Out
        </div>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, padding: '20px' }}>
        <header
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          <div>
            <img src="./Choice_Foundation.png" alt="Company Logo" style={{ height: '40px' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <i
              className="fa fa-user-circle"
              style={{ fontSize: '30px', marginRight: '10px' }}
            ></i>
            <span style={{ color: 'black' }}>{user_name}</span>
          </div>
        </header>

        <h2 style={{ color: 'black', marginBottom: '20px' }}>Meetings In-Progress</h2>

        {/* Search Bar and Date Range Filters */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '20px',
          }}
        >
          {/* Search Bar */}
          <input
            type="text"
            placeholder="Search by Meeting ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              padding: '10px',
              border: '1px solid #ccc',
              borderRadius: '4px',
              width: '100%',
              maxWidth: '300px',
              marginRight: '20px',
            }}
          />

          {/* Date Filters */}
          <input
            type="date"
            value={filters.startDate}
            onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '10px' }}
          />
          <input
            type="date"
            value={filters.endDate}
            onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
            style={{ padding: '10px', borderRadius: '4px', border: '1px solid #ccc', marginRight: '20px' }}
          />

          <button
            onClick={handleClearDates}
            style={{
              padding: '10px 20px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            Clear Dates
          </button>
        </div>

        {/* Table */}
        <div style={{ textAlign: 'center' }}>
          {filteredMeetings.length > 0 ? (
            <table
              style={{
                color: 'black',
                width: '100%',
                borderCollapse: 'collapse',
                marginTop: '20px',
              }}
            >
              <thead>
                <tr style={{ backgroundColor: '#e9ecef' }}>
                  <th>Meeting ID</th>
                  <th>Camp Id</th>
                  <th>DateTime</th>
                  <th>Total Students to be examined</th>
                  <th>Total Students Examined</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
              {filteredMeetings.map((meeting) => {
                  // Find the camp corresponding to the current meeting's campID
                  const camp = camps.find((c) => c.campID === meeting.campID);

                  return (
                    <tr
                      key={meeting.meetID}
                      style={{
                        backgroundColor: '#f9f9fc',
                        color: 'black',
                      }}
                      onClick={() => handleRowClick(meeting.meetID)}
                    >
                      <td>{meeting.meetID}</td>
                      <td>{meeting.campID}</td>
                      <td>{new Date(meeting.dateTime).toLocaleDateString()}</td>
                      <td>{camp ? camp.studentsScreenedPositive : 'N/A'}</td>
                      <td>{camp ? camp.studentsFollowedUp : 'N/A'}</td>
                      <td>
                        <button
                          style={{
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            padding: '10px 30px',
                            cursor: 'pointer',
                            borderRadius: '4px',
                          }}
                          onClick={() => handleRowClick(meeting.meetID)}
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          ) : (
            <p style={{ color: 'black' }}>No Meetings In-Progress</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Meetings_inprogress;
