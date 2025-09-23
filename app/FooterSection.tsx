"use client";

import { Mail, Phone, MapPin, Facebook, Twitter, Instagram, AudioWaveform } from "lucide-react";


const FooterSection = () => {
    return (
        <footer className="bg-muted/70 text-muted-foreground py-6 mt-8 border-t border-border backdrop-blur-md">
            <div className="container mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Brand */}
                <div>
                    <h2 className="text-xl font-bold text-foreground mb-2"> <AudioWaveform/> HearSafe</h2>
                    <p className="text-xs">
                        Helping older adults check their hearing safely, quickly, and from the
                        comfort of home.
                    </p>
                </div>

                {/* Quick Links */}
                <div>
                    <h3 className="text-base font-semibold text-foreground mb-2">Quick Links</h3>
                    <ul className="space-y-1 text-xs">
                        <li><a href="/" className="hover:text-primary transition-colors">Home</a></li>
                        <li><a href="#about" className="hover:text-primary transition-colors">About</a></li>
                        <li><a href="#contact" className="hover:text-primary transition-colors">Contact</a></li>
                        <li><a href="#testimonials" className="hover:text-primary transition-colors">Testimonials</a></li>
                    </ul>
                </div>

                {/* Contact Info */}
                <div>
                    <h3 className="text-base font-semibold text-foreground mb-2">Contact Us</h3>
                    <ul className="space-y-2 text-xs">
                        <li className="flex items-center gap-2"><Mail size={14} /> support@hearsafe.com</li>
                        <li className="flex items-center gap-2"><Phone size={14} /> +1 (555) 123-4567</li>
                        <li className="flex items-center gap-2"><MapPin size={14} /> 123 Wellness Street, New York, NY</li>
                    </ul>
                </div>

                {/* Social Media */}
                <div>
                    <h3 className="text-base font-semibold text-foreground mb-2">Follow Us</h3>
                    <div className="flex gap-3">
                        <a href="#" className="hover:text-primary transition-colors"><Facebook size={16} /></a>
                        <a href="#" className="hover:text-primary transition-colors"><Twitter size={16} /></a>
                        <a href="#" className="hover:text-primary transition-colors"><Instagram size={16} /></a>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="border-t border-border mt-4 pt-3 text-center text-xs">
                © {new Date().getFullYear()} HearSafe. All rights reserved.
            </div>
        </footer>

    );
};

export default FooterSection;
