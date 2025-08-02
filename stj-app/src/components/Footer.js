import React from 'react';

const Footer = () => {
    return (
        <footer className="bg-gray-900 text-white py-4">
            <div className="container mx-auto text-center">
                <p>&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
                <div className="mt-2">
                    <a href="/privacy-policy" className="text-gray-400 hover:text-white mx-2">Privacy Policy</a>
                    <a href="/terms-of-service" className="text-gray-400 hover:text-white mx-2">Terms of Service</a>
                </div>
            </div>
        </footer>
    );
};

export default Footer;