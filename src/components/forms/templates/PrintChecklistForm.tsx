import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { cn } from "@/lib/utils"

interface PrintChecklistFormProps {
  departmentColor?: string
}

export function PrintChecklistForm({ departmentColor = "#004B93" }: PrintChecklistFormProps) {
  const [formData, setFormData] = useState({
    client: "",
    project: "",
    date: "",
    vinNumber: "",
    invoice: "",
    printer: {
      hp365: false,
      hp570: false,
    },
    laminate: {
      yes: false,
      no: false,
    },
    substrate: {
      avery1105: false,
      briteline: false,
      perf: false,
      other: false,
    },
    flags: {
      mirroredGraphics: false,
      fleet: false,
    },
  })

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

  const [checkedTasks, setCheckedTasks] = useState(new Array(tasks.length).fill(false))

  const handleTaskCheck = (index: number) => {
    setCheckedTasks(prev => prev.map((checked, i) => i === index ? !checked : checked))
  }

  return (
    <div className="w-full max-w-4xl mx-auto bg-white">
      {/* Header */}
      <div className="flex justify-between items-center p-4" style={{ backgroundColor: departmentColor }}>
        <h1 className="text-2xl font-bold text-white">PRINT CHECKLIST</h1>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <Checkbox 
              checked={formData.flags.mirroredGraphics}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  flags: { ...prev.flags, mirroredGraphics: checked as boolean }
                }))
              }
              className="h-5 w-5 border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <span className="text-red-400 font-bold">Mirrored Graphical Items</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox 
              checked={formData.flags.fleet}
              onCheckedChange={(checked) => 
                setFormData(prev => ({
                  ...prev,
                  flags: { ...prev.flags, fleet: checked as boolean }
                }))
              }
              className="h-5 w-5 border-2 border-white data-[state=checked]:bg-white data-[state=checked]:text-black"
            />
            <span className="text-red-400 font-bold">FLEET</span>
          </label>
        </div>
      </div>

      {/* Form Fields */}
      <div className="p-4 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label className="font-bold">Client:</Label>
            <Input
              type="text"
              value={formData.client}
              onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
              className="border-0 border-b border-black rounded-none focus-visible:ring-0 px-0"
            />
          </div>
          <div>
            <Label className="font-bold">Project:</Label>
            <Input
              type="text"
              value={formData.project}
              onChange={(e) => setFormData(prev => ({ ...prev, project: e.target.value }))}
              className="border-0 border-b border-black rounded-none focus-visible:ring-0 px-0"
            />
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label className="font-bold">Date:</Label>
            <Input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="border-0 border-b border-black rounded-none focus-visible:ring-0 px-0"
            />
          </div>
          <div>
            <Label className="font-bold">VIN Number:</Label>
            <Input
              type="text"
              value={formData.vinNumber}
              onChange={(e) => setFormData(prev => ({ ...prev, vinNumber: e.target.value }))}
              className="border-0 border-b border-black rounded-none focus-visible:ring-0 px-0"
            />
          </div>
          <div>
            <Label className="font-bold">Invoice#:</Label>
            <Input
              type="text"
              value={formData.invoice}
              onChange={(e) => setFormData(prev => ({ ...prev, invoice: e.target.value }))}
              className="border-0 border-b border-black rounded-none focus-visible:ring-0 px-0"
            />
          </div>
        </div>

        <p className="italic text-sm">
          Each item MUST be completed prior to sign off. Signature equals financial responsibility for step or any cost required to fix.
        </p>

        {/* Printer and Substrate Selection */}
        <div className="space-y-2">
          <div className="flex gap-4 items-center">
            <span className="font-bold">PRINTER:</span>
            <label className="flex items-center gap-1">
              <Checkbox 
                checked={formData.printer.hp365}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    printer: { ...prev.printer, hp365: checked as boolean }
                  }))
                }
                className="h-4 w-4 rounded-sm"
              />
              HP365
            </label>
            <label className="flex items-center gap-1">
              <Checkbox 
                checked={formData.printer.hp570}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    printer: { ...prev.printer, hp570: checked as boolean }
                  }))
                }
                className="h-4 w-4 rounded-sm"
              />
              HP570
            </label>
            <span className="font-bold ml-4">LAMINATE:</span>
            <label className="flex items-center gap-1">
              <Checkbox 
                checked={formData.laminate.yes}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    laminate: { ...prev.laminate, yes: checked as boolean }
                  }))
                }
                className="h-4 w-4 rounded-sm"
              />
              Yes
            </label>
            <label className="flex items-center gap-1">
              <Checkbox 
                checked={formData.laminate.no}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    laminate: { ...prev.laminate, no: checked as boolean }
                  }))
                }
                className="h-4 w-4 rounded-sm"
              />
              No
            </label>
          </div>

          <div className="flex gap-4 items-center">
            <span className="font-bold">SUBSTRATE:</span>
            <label className="flex items-center gap-1">
              <Checkbox 
                checked={formData.substrate.avery1105}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    substrate: { ...prev.substrate, avery1105: checked as boolean }
                  }))
                }
                className="h-4 w-4 rounded-sm"
              />
              Avery1105
            </label>
            <label className="flex items-center gap-1">
              <Checkbox 
                checked={formData.substrate.briteline}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    substrate: { ...prev.substrate, briteline: checked as boolean }
                  }))
                }
                className="h-4 w-4 rounded-sm"
              />
              Briteline
            </label>
            <label className="flex items-center gap-1">
              <Checkbox 
                checked={formData.substrate.perf}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    substrate: { ...prev.substrate, perf: checked as boolean }
                  }))
                }
                className="h-4 w-4 rounded-sm"
              />
              Perf
            </label>
            <label className="flex items-center gap-1">
              <Checkbox 
                checked={formData.substrate.other}
                onCheckedChange={(checked) => 
                  setFormData(prev => ({
                    ...prev,
                    substrate: { ...prev.substrate, other: checked as boolean }
                  }))
                }
                className="h-4 w-4 rounded-sm"
              />
              Other
            </label>
          </div>
        </div>

        {/* Tasks Section */}
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
                    className={cn(
                      "w-6 h-6 border-2 border-black rounded-full cursor-pointer",
                      checkedTasks[index] ? "bg-black" : "bg-white"
                    )}
                  />
                </div>
                <div className="flex-1 p-2 text-sm">
                  {task}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
} 