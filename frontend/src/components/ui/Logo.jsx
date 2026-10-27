import React from 'react';
import { Link } from 'react-router-dom';

export default function Logo({ className = "text-xl", iconSize = "w-8 h-8", light = false }) {
  return (
    <Link 
      to="/" 
      className={`inline-flex items-center gap-2.5 font-bold tracking-tight transition-transform duration-200 hover:scale-105 ${className}`}
      aria-label="CommuteX - Go to homepage"
    >
      <div className={`${iconSize} rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-0.5 shadow-md flex items-center justify-center flex-shrink-0`}>
        <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center overflow-hidden">
          <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 text-cyan-400" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" />
            <circle cx="7" cy="17" r="2" fill="currentColor" />
            <path d="M9 17h6" />
            <circle cx="17" cy="17" r="2" fill="currentColor" />
          </svg>
        </div>
      </div>
      <span className={light ? "text-white" : "text-slate-900 font-extrabold"}>
        Commute<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-cyan-400">X</span>
      </span>
    </Link>
  );
}
