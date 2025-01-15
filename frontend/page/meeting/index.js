import {useState} from 'react';
import API from '../../utils/api';

export default function Meeting() {
    const [formData, setFormData] = useState({
        topic : '',
        start_time : '',
        duration : 0,
    });

    const [meetings, setMeetings] = useState([]);
    const [error, setError] = useState('');

    const fetchMeeting = async () => {      
        try {
            const response = await API.get('/meeting');
            setMeetings(response.data);
        } catch (error) {
            setError('Failed to fetch meetings');
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await API.post('/meeting', formData);
            fetchMeeting();
        } catch (error) {
            setError('Failed to create meeting');
        }
    };

    const handleDelete = async (id) => {
        try {
            await API.delete(`/meeting/${id}`);
            fetchMeeting();
        } catch (error) {
            setError('Failed to delete meeting');
        }
    }

    const handleInputChange = (e) => {
        const {
            name, value
        } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };



    return (
        <div>
            <h1>Meeting</h1>
            <form onSubmit={handleCreate}>
                <input type="text" name="topic" value={formData.topic} placeholder="Topic" onChange={handleInputChange} />
                <input type="datetime-local" name="start_time" value={formData.start_time} onChange={handleInputChange} />
                <input type="number" name="duration" value={formData.duration} placeholder="Duration" onChange={handleInputChange} />
                <button type="submit">Create Meeting</button>
            </form>
            </div>
    );
}