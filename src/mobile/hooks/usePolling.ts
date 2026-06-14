import { useEffect, useRef } from 'react'; 
 
export function usePolling( 
 callback: () => Promise<void>, 
 interval = 3000, 
 enabled = true 
) { 
 const callbackRef = useRef(callback); 
 const runningRef = useRef(false); 
 
 useEffect(() => { 
   callbackRef.current = callback; 
 }, [callback]); 
 
 useEffect(() => { 
   if (!enabled) return; 
 
   const timer = setInterval(async () => { 
     if (runningRef.current) return; 
 
     try { 
       runningRef.current = true; 
       await callbackRef.current(); 
     } finally { 
       runningRef.current = false; 
     } 
   }, interval); 
 
   return () => clearInterval(timer); 
 }, [interval, enabled]); 
} 