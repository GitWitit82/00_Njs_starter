'use client'

import { useState } from 'react'

const tasks = [
  "CONFIRMED PRINTER IS UP TO DATE WITH PREVENTATIVE MAINTENANCE",
  "Performed a Full Print Optimization Process",
  'Confirmed that "space between print" settings in ONYX is .5" for standard; 2.5-3" for cut graphics using plotter',
  "Confirmed that substrate in printer matches job requirements for the project",
  "Confirmed that printer has enough substrate as required for what you just loaded to print.\n(Add a 5 foot buffer to the requirement be sure you have enough vinyl)",
  "Confirmed that take up roll is attached to vinyl printer (or a plan for catching vinyl is set)",
  "Confirmed that substrate in printer was advanced if needed for tape marks and/or damaged areas to clear the final printing area",
  "Confirmed that all panels being printed have been TURNED and EXPANDED to ACTUAL PRINT SIZE",
  "Confirmed wrap panels with white backgrounds have crop marks/frame to aid in cutting",
  "Confirm edge clips are in proper position",
  'Confirmed that if multiple PRINT CUTS jobs are being printed, "conserve media" is NOT selected and they are printed as individual jobs with their own barcodes.',
  "Confirmed that all ink levels in printer are ready to print. MUST BE IN THE SHOP to change inks if any color is less than 10% full or a solid color is being printed.",
  "Changed Ink Cartridges below 10%, if necessary, when setting up printer for overnight printing",
  "Confirmed gutter is included in print MUST GET SIGN OFF TO NOT INCLUDE",
  "Print Test Prints: To test photo quality and colors MUST GET SIGNED; View outside\n(samples must show key areas; solid, logo, image etc.) Ideal sizes: 5\"x 26\"or 5\" x 52\" stripes",
  "Before photo printed for rolling wall",
  "Compared Printed Color to Paint Wrap if color Paint Wrap is being used.",
  "If Wrap is from a Fleet (see check box at top of page) Compared Printed Sample to Past Printed Sample/photo(s)",
  "Vinyl usage under 85% must be discussed",
  "Printer must be watched while printing first panel and checked every 10 minutes to confirm no issues occur"
]

export default function Checklist() {
  const [checkedTasks, setCheckedTasks] = useState(new Array(tasks.length).fill(false))

  const handleTaskCheck = (index: number) => {
    setCheckedTasks(prev => prev.map((checked, i) => i === index ? !checked : checked))
  }

  return (
    <div className="mt-6">
      <div className="bg-black text-white p-2 text-center font-bold">
        TASKS
      </div>
      <p className="text-sm my-2">
        These steps MUST be completed & checked in this order before printing. Failure to do so may result in wasted
        vinyl & print time. All failures that result because of skipped steps will be the financial responsibility of the person
        hitting the "print" button on the printer. TAKE YOUR TIME AND MAKE SURE THIS IS ALL CHECKED
      </p>

      <div className="border border-black">
        {tasks.map((task, index) => (
          <div key={index} className="flex border-b border-black last:border-b-0">
            <div className="w-12 p-2 border-r border-black text-center font-bold">
              {index + 1}
            </div>
            <div className="w-12 p-2 border-r border-black flex items-center justify-center">
              <div 
                onClick={() => handleTaskCheck(index)}
                className={`w-6 h-6 border-2 border-black rounded-full cursor-pointer ${
                  checkedTasks[index] ? 'bg-black' : 'bg-white'
                }`} 
              />
            </div>
            <div className="flex-1 p-2 text-sm">
              {task}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

