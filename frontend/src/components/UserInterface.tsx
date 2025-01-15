import React, {useState, useEffect} from "react";
import axios from "axios";
import CardComponent from "./CardComponent";


interface Meeting {
    id: number;
    zoomMeetingId: string;
    topic: string;
    startTime: string;
    duration: number;
}

interface MeetingInterfaceProps{
    backendName: string;
}

const MeetingInterface: React.FC<MeetingInterfaceProps> = ({backendName}) => {
    const  apiURL = process.env.REACT_APP_API_URL || "http://localhost:8000";
    const [meetings, setMeetings] = useState<Meeting[]>([]);
    const [newMeeting, setNewMeeting] = useState({zoomMeetingId: "",topic: "", startTime: "", duration: 0});
    const [updateMeeting, setUpdateMeeting] = useState({id: "",zoomMeetingId: "", topic: "", startTime: "", duration: 0});   

    const backgroundColors: {
        [key: string] : string
    } = { go : 'bg-cyan-500', };

    const buttonColors: {
        [key: string] : string
    } = {
        go : 'bg-cyan-700 hover:bg-blue-600',
    }

    const bgColor = backgroundColors[backendName as keyof typeof backgroundColors] || 'bg-gray-200';
    const btnColor = buttonColors[backendName as keyof typeof buttonColors] || 'bg-gray-500 hover:bg-gray-600';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get(`${apiURL}/api/${backendName}/meetings`);
                setMeetings(response.data.reverse());
            } catch (error) {
                console.error('Error fetching data:',error);
            }
        };

        fetchData();
    }, [backendName, apiURL]);

    const createMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${apiURL}/api/${backendName}/meetings`, newMeeting);
            setMeetings([response.data, ...meetings]);
            setNewMeeting({zoomMeetingId:"",topic: "", startTime: "", duration: 0});
        } catch (error) {
            console.error('Error creating meeting:', error);
        }
    };


    const handleUpdateMeeting = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        try {
            await axios.put(`${apiURL}/api/${backendName}/meetings/${updateMeeting.id}`, {
                zoomMeetingId: updateMeeting.zoomMeetingId,
                topic: updateMeeting.topic,
                startTime: updateMeeting.startTime,
                duration: updateMeeting.duration,
            });
            setUpdateMeeting({id: "",zoomMeetingId:"", topic: "", startTime: "", duration: 0});
            setMeetings(
                meetings.map((meeting) => { if (meeting.id  === parseInt(updateMeeting.id)){
                    return {...meeting, zoomMeetingId:updateMeeting.zoomMeetingId, topic: updateMeeting.topic, startTime: updateMeeting.startTime, duration: updateMeeting.duration};
                }
                return meeting;
            })
            );
        } catch (error) {
            console.error('Error updating meeting:', error);
        }
    }

    const deleteMeeting = async (id: number) => {
        try {
            await axios.delete(`${apiURL}/api/${backendName}/meetings/${id}`);
            setMeetings(meetings.filter((meeting) => meeting.id !== id));
        } catch (error) {
            console.error('Error deleting meeting:', error);
        }
    }


    return (
        <div className={`user-interface ${bgColor} ${backendName} w-full max-w-md p-4 rounded-shadow`}>
            <h2 className="text-xl font-bold text-center text-white mb-6">{`${backendName.charAt(0).toUpperCase() + backendName.slice(1)} & Next Js Backend`}</h2>

            <form onSubmit={createMeeting} className="mb-6 p-4 bg-blue-100 rounded shadow">
            <input placeholder="Zoom Meeting ID" 
            className="w-full p-2 mb-2" 
            value={newMeeting.zoomMeetingId} 
            onChange={(e) => setNewMeeting({...newMeeting, zoomMeetingId: e.target.value})} />
            
            <input placeholder="Topic" 
            className="w-full p-2 mb-2" 
            value={newMeeting.topic} 
            onChange={(e) => setNewMeeting({...newMeeting, topic: e.target.value})} />
            
            <input type="date" placeholder="Start Time" 
            className="w-full p-2 mb-2" 
            value={newMeeting.startTime} 
            onChange={(e) => setNewMeeting({...newMeeting, startTime: e.target.value})} />
            
            <input placeholder="Duration" 
            className="w-full p-2 mb-2" 
            value={newMeeting.duration} 
            onChange={(e) => setNewMeeting({...newMeeting, duration: parseInt(e.target.value)})} />

            {/* <input placeholder="Created At" 
            className="w-full p-2 mb-2" 
            value={newMeeting.createdAt} 
            onChange={(e) => setNewMeeting({...newMeeting, createdAt: e.target.value})} /> */}
            
            <button type="submit" className={`w-full p-2 rounded text-white ${btnColor}`}>
                Add Meeting
            </button>
            </form>
        
            <form onSubmit={handleUpdateMeeting} className="mb-6 p-4 bg-blue-100 rounded shadow">
                <input placeholder="ID"
                value={updateMeeting.id}
                onChange={(e) => setUpdateMeeting({...updateMeeting, id: e.target.value})}
                className="mb-2 w-full p-2 border border-gray-300 rounded" />
                
                <input placeholder="Zoom ID"
                value={updateMeeting.zoomMeetingId}
                onChange={(e) => setUpdateMeeting({...updateMeeting, zoomMeetingId: e.target.value})}
                className="mb-2 w-full p-2 border border-gray-300 rounded" />
                
                <input placeholder="New Topic"
                value={updateMeeting.topic}
                onChange={(e) => setUpdateMeeting({...updateMeeting, topic: e.target.value})} 
                className="mb-2 w-full p-2 border border-gray-300 rounded"/>

                <input  type="date" placeholder="New Start Time"
                value={updateMeeting.startTime}
                onChange={(e) => setUpdateMeeting({...updateMeeting, startTime: e.target.value})}
                className="mb-2 w-full p-2 border border-gray-300 rounded" />

                <input placeholder="New Duration"
                value={updateMeeting.duration}
                onChange={(e) => setUpdateMeeting({...updateMeeting, duration: parseInt(e.target.value)})}
                className="mb-2 w-full p-2 border border-gray-300 rounded" />

                {/* <input placeholder="New Created At"
                value={updateMeeting.createdAt}
                onChange={(e) => setUpdateMeeting({...updateMeeting, createdAt: e.target.value})}
                className="mb-2 w-full p-2 border border-gray-300 rounded" /> */}


                <button type="submit" className={`w-full p-2 rounded text-white ${btnColor}`}>
                    Update Meeting </button>
            </form>

            <div className="space-y-4">
                {
                    meetings.map((meeting) => (
                        <div key={meeting.id} className="bg-white p-4 rounded shadow">
                            <CardComponent card={meeting} />
                            <button onClick={() => deleteMeeting(meeting.id)} className="w-full p-2 rounded text-white bg-red-500 hover:bg-red-700">
                                Delete Meeting
                            </button>

                        </div>
                    ))
                }
            </div>
        </div>
        );
};

export default MeetingInterface;