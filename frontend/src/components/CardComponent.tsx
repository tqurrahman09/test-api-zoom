import React from "react";

interface Meeting{
    id: number;
    zoom_meeting_id: string;
    topic: string;
    start_time : string;
    duration: number;
    createdAt: string;
}

const CardComponent: React.FC<{card : Meeting}> = ({ card }) => {
    return (
        <div className="bg-white shadow-lg rounded-lg p-2 mb-2 hover:bg-gray-100">
            <h3 className="text-md text-gray-800">Id : {card.id}</h3>
            <p className="text-lg font-semibold text-gray-600">Zoom Meeting Id: {card.zoom_meeting_id}</p>
            <p className="text-lg font-semibold text-gray-700">Topic: {card.topic}</p>
            <p className="text-md text-gray-800">Start Time: {card.start_time}</p>
            <p className="text-md text-gray-700">Duration: {card.duration} minutes</p>
        </div>
    );
};

export default CardComponent;