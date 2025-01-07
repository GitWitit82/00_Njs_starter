export default function Header() {
  return (
    <div className="bg-[#004B93] text-white p-4 flex justify-between items-center">
      <h1 className="text-2xl font-bold">PRINT CHECKLIST</h1>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-5 w-5 border-2" />
          <span className="text-red-500 font-bold">Mirrored Graphical Items</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" className="h-5 w-5 border-2" />
          <span className="text-red-500 font-bold">FLEET</span>
        </label>
      </div>
    </div>
  )
}

