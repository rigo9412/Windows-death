'use client';

import { useEffect, useState } from 'react';

export default function BSOD() {
  const [displayedText, setDisplayedText] = useState('');
  const fullText = `A problem has been detected and windows has been shut down to prevent damage
to your computer.

The problem seems to be caused by the following file: WINDOWSUTIL.SYS

DRIVER_IRQL_NOT_LESS_OR_EQUAL

If this is the first time you've seen this stop error screen,
restart your computer. If this screen appears again, follow
these steps:

Check to make sure any new hardware or software is properly installed.
If this is a new installation, ask your hardware or software manufacturer
for any windows updates you might be missing.

If problems continue, disable or remove any newly installed hardware
or software. Disable BIOS memory options such as caching or shadowing.
If you need to use safe mode to remove or disable components, restart
your computer, press F8 to select Advanced Startup Options, and then
select Safe Mode.

Technical information:
*** STOP: 0x0000000A (0x00000004, 0x00000002, 0x00000000, 0x8054C557)`;

  useEffect(() => {
    let index = 0;
    const timer = setInterval(() => {
      if (index <= fullText.length) {
        setDisplayedText(fullText.slice(0, index));
        index++;
      } else {
        clearInterval(timer);
      }
    }, 15);

    return () => clearInterval(timer);
  }, [fullText]);

  return (
    <div className="w-full h-screen bg-blue-600 flex items-center justify-center p-8 font-mono text-white overflow-hidden">
      <div className="max-w-2xl w-full">
        <div className="whitespace-pre-wrap text-sm leading-relaxed wrap-break-word">
          {displayedText}
          <span className="animate-pulse">█</span>
        </div>
      </div>
    </div>
  );
}
