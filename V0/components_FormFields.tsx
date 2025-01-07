'use client'

import { useState } from 'react'

export default function FormFields() {
  const [formData, setFormData] = useState({
    client: '',
    project: '',
    date: '',
    vinNumber: '',
    invoice: '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="font-bold">Client:</label>
          <input
            type="text"
            name="client"
            className="w-full border-b border-black"
            onChange={handleInputChange}
            value={formData.client}
          />
        </div>
        <div>
          <label className="font-bold">Project:</label>
          <input
            type="text"
            name="project"
            className="w-full border-b border-black"
            onChange={handleInputChange}
            value={formData.project}
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="font-bold">Date:</label>
          <input
            type="text"
            name="date"
            className="w-full border-b border-black"
            onChange={handleInputChange}
            value={formData.date}
          />
        </div>
        <div>
          <label className="font-bold">VIN Number:</label>
          <input
            type="text"
            name="vinNumber"
            className="w-full border-b border-black"
            onChange={handleInputChange}
            value={formData.vinNumber}
          />
        </div>
        <div>
          <label className="font-bold">Invoice#:</label>
          <input
            type="text"
            name="invoice"
            className="w-full border-b border-black"
            onChange={handleInputChange}
            value={formData.invoice}
          />
        </div>
      </div>

      <p className="italic text-sm">Each item MUST be completed prior to sign off. Signature equals financial responsibility for step or any cost required to fix.</p>

      <PrinterSubstrateSelection />
    </div>
  )
}

function PrinterSubstrateSelection() {
  return (
    <div className="space-y-2">
      <div className="flex gap-4">
        <span className="font-bold">PRINTER:</span>
        <label className="flex items-center gap-1">
          <input type="checkbox" className="h-4 w-4" />
          HP365
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" className="h-4 w-4" />
          HP570
        </label>
        <span className="font-bold ml-4">LAMINATE:</span>
        <label className="flex items-center gap-1">
          <input type="checkbox" className="h-4 w-4" />
          Yes
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" className="h-4 w-4" />
          No
        </label>
      </div>

      <div className="flex gap-4">
        <span className="font-bold">SUBSTRATE:</span>
        <label className="flex items-center gap-1">
          <input type="checkbox" className="h-4 w-4" />
          Avery1105
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" className="h-4 w-4" />
          Briteline
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" className="h-4 w-4" />
          Perf
        </label>
        <label className="flex items-center gap-1">
          <input type="checkbox" className="h-4 w-4" />
          Other
        </label>
      </div>
    </div>
  )
}

