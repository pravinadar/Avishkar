import React, { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import myImage from '../images/chat.png'; // Adjust the path as needed

// Initialize Supabase client
const supabaseUrl = 'https://eigjsfnuexxzegklbrpe.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZ2pzZm51ZXh4emVna2xicnBlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjkxNTcyMDQsImV4cCI6MjA0NDczMzIwNH0.UthdXU4fE95rie81KHPq9eusPq2LjhSKc_DUkTwIUSk'; // Replace with your Supabase public anon key
const supabase = createClient(supabaseUrl, supabaseKey);

const Chatbox = () => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [showOptions, setShowOptions] = useState(false);
    const [selectedOption, setSelectedOption] = useState(null); // Keep track of the selected option

    const initialGreeting = "How can I assist you today?";
    const options = [
        "1) Total sales amount and product count based on date",
        "2) Total people at a particular date"
    ];

    const handleGreetingClick = () => {
        setShowOptions(true);
        const greetingMessage = { text: initialGreeting, sender: 'bot' };
        setMessages((prev) => [...prev, greetingMessage]);
    };

    const fetchSalesData = async (option, date = '') => {
        let responseMessage = '';
    
        try {
            const parsedDate = new Date(date);
            if (isNaN(parsedDate.getTime())) {
                return `The date "${date}" is invalid. Please provide a valid date.`;
            }
    
            const formattedDate = parsedDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD
    
            if (option === 1) { // Sales amount, product count, and timestamp count on specific date
                const { data, error } = await supabase
                    .from('payments')
                    .select('*')
                    .eq('PaymentDate', formattedDate); // Ensure the date matches PaymentDate in YYYY-MM-DD format
    
                if (error) throw error;
    
                if (data.length === 0) {
                    responseMessage = `No sales recorded on ${date}.`;
                } else {
                    // Calculate the total amount, items sold, and count of products
                    let totalAmount = 0;
                    let totalItemCount = 0; // To track total products sold
                    let itemsSold = '';
    
                    data.forEach((payment) => {
                        // If the cart is already an object, use it directly; otherwise, parse it
                        const cartItems = typeof payment.cart === 'object' ? payment.cart : JSON.parse(payment.cart);
    
                        if (cartItems.length > 0) {
                            const itemDetails = cartItems.map(cartItem => {
                                const itemTotal = cartItem.price * cartItem.quantity;
                                totalAmount += itemTotal;
                                totalItemCount += cartItem.quantity; // Accumulate the total quantity sold
                                return `${cartItem.name} (Quantity: ${cartItem.quantity}): ₹${itemTotal.toFixed(2)}`;
                            }).join(', ');
    
                            itemsSold += itemDetails + ', ';
                        }
                    });
    
                    // Clean up the final string
                    itemsSold = itemsSold.slice(0, -2); // Remove trailing comma and space
    
                    const currentTime = new Date(); // Get the current timestamp
                    const formattedCurrentTime = currentTime.toISOString(); // Format as ISO string
    
                    responseMessage = (
                        <>
                          Sales on {date}:<br />
                          Total sales amount: <strong>₹{totalAmount.toFixed(2)}</strong><br />
                          Total items sold:<strong> {totalItemCount}</strong><br />
                          Timestamp at request: <strong>{formattedCurrentTime}</strong>
                        </>
                      );
                                      }
            }
        } catch (error) {
            console.error('Error fetching data:', error);
            responseMessage = "Sorry, there was an error fetching the data.";
        }
    
        return responseMessage;
    };


    const fetchPeopleCount = async (date) => {
        let responseMessage = '';
    
        try {
            const [year, month, day] = date.split('-');
            const formattedStartDate = `${year}-${month}-${day} 00:00:00`; // Start of the day
            const formattedEndDate = `${year}-${month}-${day} 23:59:59`;   // End of the day
    
            console.log('Fetching data between:', formattedStartDate, 'and', formattedEndDate); // Debugging line
    
            const { data, error } = await supabase
                .from('peopledata')
                .select('lastCount, timestamp')
                .gte('timestamp', formattedStartDate)
                .lte('timestamp', formattedEndDate);
    
            if (error) throw error;
    
            console.log('Data retrieved:', data); // Debugging line
    
            if (data.length === 0) {
                responseMessage = `No records found for ${date}.`;
            } else {
                const totalCount = data.reduce((acc, record) => acc + parseInt(record.lastCount, 10) || 0, 0);
                responseMessage = `Total people counted on ${date}: ${totalCount}`;
            }
        } catch (error) {
            console.error('Error fetching people count:', error);
            responseMessage = "Sorry, there was an error fetching the people count.";
        }
    
        return responseMessage;
    };
    
    
    const insertPeopleCount = async (lastCount) => {
        const timestamp = new Date().toISOString(); // Current timestamp in ISO format
    
        try {
            const { data, error } = await supabase
                .from('peopledata')
                .insert([
                    { lastCount, Timestamp: timestamp }
                ]);
    
            if (error) throw error;
    
            return 'People count inserted successfully!';
        } catch (error) {
            console.error('Error inserting people count:', error);
            return 'Error inserting people count.';
        }
    };
    

    const handleOptionSelect = (option) => {
        const newMessage = { text: `You selected: ${options[option - 1]}`, sender: 'user' };
        setMessages((prev) => [...prev, newMessage]);
        setSelectedOption(option);
        setShowOptions(false);
    
        const responseMessage = {
            text: "Please provide a date (YYYY-MM-DD):",
            sender: 'bot',
        };
        setMessages((prev) => [...prev, responseMessage]);
    };
    
    const handleSend = async (e) => {
        e.preventDefault();
        const newMessage = { text: input, sender: 'user' };
        setMessages((prev) => [...prev, newMessage]);
    
        if (selectedOption) {
            if (input.match(/^\d{4}-\d{2}-\d{2}$/)) {
                let responseMessage = '';
    
                if (selectedOption === 1) {
                    responseMessage = await fetchSalesData(selectedOption, input); // Call fetchSalesData here
                } else if (selectedOption === 2) {
                    responseMessage = await fetchPeopleCount(input);
                }
    
                const botResponse = { text: responseMessage || "I'm not sure how to answer that.", sender: 'bot' };
                setMessages((prev) => [...prev, botResponse]);
                setInput('');
                setSelectedOption(null);
    
                const moreHelpMessage = { text: "Do you want more help? (Yes/No)", sender: 'bot' };
                setMessages((prev) => [...prev, moreHelpMessage]);
                return;
            } else {
                const botResponse = {
                    text: 'Sorry, I can’t understand. Please provide a valid date in YYYY-MM-DD format.',
                    sender: 'bot',
                };
                setMessages((prev) => [...prev, botResponse]);
                setInput('');
                return;
            }
        }
    
        // Handling "Yes" or "No" for more help
        if (input.toLowerCase() === 'yes') {
            setShowOptions(true);
        } else if (input.toLowerCase() === 'no') {
            const thankYouMessage = { text: 'Thank you! If you want to start again, type "analysis".', sender: 'bot' };
            setMessages((prev) => [...prev, thankYouMessage]);
        } else if (input.toLowerCase() === 'analysis') {
            handleGreetingClick();
        } else {
            const botResponse = {
                text: "Sorry, I can't understand you. Please try again or ask for help.",
                sender: 'bot',
            };
            setMessages((prev) => [...prev, botResponse]);
        }
    
        setInput('');
    };
    
    
    const toggleChatbox = () => {
        setIsOpen((prev) => !prev);
        if (!isOpen) {
            handleGreetingClick();
        }
    };

    return (
        <div>
            <div onClick={toggleChatbox} style={styles.chatIcon}>
                <img 
                    src={myImage}
                    alt="Chatbot"
                    style={styles.chatIconImage}
                />
            </div>
            {isOpen && (
                <div style={styles.chatbox}>
                    <div style={styles.messages}>
                        {messages.map((msg, index) => (
                            <div
                                key={index}
                                style={{
                                    textAlign: msg.sender === 'user' ? 'right' : 'left',
                                    padding: '5px',
                                }}
                            >
                                <span style={{
                                    ...styles.message,
                                    backgroundColor: msg.sender === 'user' ? '#007bff' : '#f1f1f1',
                                    color: msg.sender === 'user' ? '#fff' : '#000',
                                }}>
                                    {msg.text}
                                </span>
                            </div>
                        ))}
                    </div>
                    {showOptions && (
                        <div style={styles.options}>
                            {options.map((option, index) => (
                                <button
                                    key={index}
                                    onClick={() => handleOptionSelect(index + 1)}
                                    style={styles.optionButton}
                                >
                                    {option}
                                </button>
                            ))}
                        </div>
                    )}
                    <form onSubmit={handleSend} style={styles.form}>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            style={styles.input}
                            placeholder="Type your message..."
                        />
                        <button type="submit" style={styles.sendButton}>Send</button>
                    </form>
                </div>
            )}
        </div>
    );
};

const styles = {
    chatIcon: {
        position: 'fixed',
        bottom: '20px', // Adjusts distance from the bottom of the page
        right: '20px',  // Adjusts distance from the right side of the page
        cursor: 'pointer',
        zIndex: 1050, // Ensures the chat icon is on top of other elements
    },
    chatIconImage: {
        width: '80px',
        height: '80px',
    },
    chatbox: {
        position: 'fixed',
        bottom: '100px', // Distance above the chat icon
        right: '20px',
        width: '350px', // Increased width for better user experience
        border: '1px solid #ccc',
        borderRadius: '10px', // Rounded corners for modern look
        backgroundColor: '#fff',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)', // Added shadow for depth
        zIndex: 1100, // Higher than chatIcon to ensure it's in front
    },
    messages: {
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '10px',
    },
    message: {
        display: 'inline-block',
        padding: '10px',
        borderRadius: '8px', // Softer rounded corners
        margin: '5px 0',
        maxWidth: '80%', // Constrain message width for readability
        wordWrap: 'break-word', // Ensure long text wraps
    },
    options: {
        padding: '10px',
    },
    optionButton: {
        margin: '5px',
        padding: '8px 12px',
        border: 'none',
        borderRadius: '5px',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
    form: {
        display: 'flex',
        padding: '10px',
        borderTop: '1px solid #ddd', // Divider between messages and input
    },
    input: {
        flex: 1,
        padding: '10px',
        border: '1px solid #ccc',
        borderRadius: '4px',
        marginRight: '10px',
    },
    sendButton: {
        padding: '10px 15px',
        border: 'none',
        borderRadius: '4px',
        backgroundColor: '#007bff',
        color: '#fff',
        cursor: 'pointer',
        transition: 'background-color 0.3s',
    },
};


export default Chatbox;
