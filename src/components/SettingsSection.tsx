/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Settings as SettingsIcon, 
  User, 
  Clock, 
  Trash2, 
  Download, 
  Upload, 
  ShieldAlert, 
  Save, 
  Info,
  Sliders,
  Lock,
  Unlock
} from 'lucide-react';
import { AppState } from '../types';
import { formatLocalDate } from '../utils/date';
import { generateSecureHash } from '../utils/hash';

interface SettingsSectionProps {
  state: AppState;
  onUpdateSettings: (settings: AppState['settings']) => void;
  onRestoreData: (restored: AppState) => void;
  onResetAllData: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  state,
  onUpdateSettings,
  onRestoreData,
  onResetAllData
}) => {
  const [editedName, setEditedName] = useState(state.settings.userName);
  const [editedGoal, setEditedGoal] = useState(String(state.settings.dailyStudyGoalMinutes || 120)); // Study goal minutes
  const [passcode, setPasscode] = useState('');
  const [isPasscodeRequired, setIsPasscodeRequired] = useState(state.settings.isPasscodeRequired || false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const minutesGoal = parseInt(editedGoal) || 120;
    
    onUpdateSettings({
      ...state.settings,
      userName: editedName.trim() || 'Champion',
      dailyStudyGoalMinutes: minutesGoal,
    });
  };

  const handleExportData = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `betterme_growth_ledger_${formatLocalDate()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    const files = e.target.files;
    if (!files || files.length === 0) return;

    fileReader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed && typeof parsed === 'object') {
          onRestoreData(parsed);
          alert("Growth ledger successfully imported and synchronized.");
        } else {
          alert("Invalid backup file coordinates.");
        }
      } catch (err) {
        alert("Fatal error analyzing backup data coordinates.");
      }
    };
    fileReader.readAsText(files[0]);
  };

  const handleHardResetPrompt = () => {
    const doubleCheck = confirm("WARNING: This will completely destroy all logged habits, calendar events, study logs, and gym sessions irreversibly. Continue?");
    if (doubleCheck) {
      onResetAllData();
    }
  };

  const textInputStyle = "bg-zinc-950/80 border border-zinc-800 rounded-xl px-4 py-2.5 text-zinc-200 text-sm focus:border-pink-500 focus:outline-none placeholder-zinc-700";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-3xl font-black font-display tracking-tight text-white flex items-center gap-2">
          <SettingsIcon className="w-8 h-8 text-pink-500 text-glow-pink" />
          <span className="text-gradient">Ledger Configurations</span>
        </h2>
        <p className="text-zinc-400 text-sm mt-1">
          Customize system constraints, manage local backup databases, or execute destructive hard resets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left column: Configurations */}
        <div className="glass-panel rounded-2xl p-5 lg:col-span-2">
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3 mb-4">
              <Sliders className="w-4 h-4 text-pink-400" />
              Coordinate Coefficients
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  <User className="w-3.5 h-3.5 text-pink-400 inline mr-1" />
                  Your Profile Title
                </label>
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  placeholder="e.g. Champion, Stoic, Alpha"
                  className={`${textInputStyle} w-full`}
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  <Clock className="w-3.5 h-3.5 text-pink-400 inline mr-1" />
                  Daily Study Limit (Minutes)
                </label>
                <input
                  type="number"
                  value={editedGoal}
                  onChange={(e) => setEditedGoal(e.target.value)}
                  placeholder="e.g. 120"
                  className={`${textInputStyle} w-full font-mono`}
                  min="1"
                  max="1440"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                className="btn btn-primary text-xs uppercase font-bold py-2.5 px-5"
              >
                <Save className="w-4 h-4" /> Save Preferences
              </button>
            </div>
          </form>
        </div>

        {/* Right column: Backups & Danger Zone */}
        <div className="space-y-6">
          
          {/* Data backups */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Download className="w-4 h-4 text-indigo-400" />
              Backup Coordination
            </h3>
            
            <p className="text-zinc-500 text-xs leading-relaxed">
              Ensure long term survival. Export your personal records to a local JSON file or import a previous build file.
            </p>

            <div className="space-y-2 pt-2">
              <button
                onClick={handleExportData}
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-zinc-950/50 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-zinc-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all"
              >
                <Download className="w-4 h-4 text-pink-400" /> Download Backup Ledger
              </button>

              <label className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-zinc-950/50 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-750 text-zinc-300 hover:text-white rounded-xl text-xs font-bold uppercase tracking-wider cursor-pointer transition-all">
                <Upload className="w-4 h-4 text-purple-400" /> Upload Backup Ledger
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportData}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Lock Screen Settings */}
          <div className="glass-panel rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-200 font-display flex items-center gap-2 border-b border-zinc-900 pb-3">
              <Lock className="w-4 h-4 text-pink-400" />
              App Protection (PWD)
            </h3>
            
            <p className="text-zinc-500 text-xs leading-relaxed">
              Enable a security passcode screen to protect your atomic growth progress, journals, and health ledger.
            </p>

            <div className="space-y-4 pt-2">
              <div className="flex items-center justify-between bg-zinc-950/40 p-3 rounded-xl border border-zinc-900">
                <span className="text-xs font-semibold text-zinc-300">Lock on Startup</span>
                <button
                  type="button"
                  onClick={() => {
                    const nextRequired = !isPasscodeRequired;
                    setIsPasscodeRequired(nextRequired);
                    if (nextRequired && !state.settings.passcodeHash) {
                      alert("Please set and save a passcode value first below.");
                      setIsPasscodeRequired(false);
                      return;
                    }
                    onUpdateSettings({
                      ...state.settings,
                      isPasscodeRequired: nextRequired
                    });
                  }}
                  className={`w-11 h-6 rounded-full p-1 transition-colors duration-300 relative ${
                    isPasscodeRequired ? 'bg-pink-500' : 'bg-zinc-800'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    isPasscodeRequired ? 'transform translate-x-5' : ''
                  }`} />
                </button>
              </div>

              <div>
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                  Change Passcode (PIN digits only)
                </label>
                <div className="flex gap-2">
                  <input
                    type="password"
                    maxLength={8}
                    pattern="[0-9]*"
                    inputMode="numeric"
                    value={passcode}
                    onChange={(e) => setPasscode(e.target.value.replace(/\D/g, ''))}
                    placeholder="e.g. 1234"
                    className="bg-zinc-950/80 border border-zinc-900/60 rounded-xl px-3 py-2 text-zinc-200 text-xs focus:border-pink-500 focus:outline-none flex-1 font-mono tracking-widest"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (!passcode) {
                        alert("Please type a secure PIN code.");
                        return;
                      }
                      
                      const hashHex = await generateSecureHash(passcode);
                      
                      onUpdateSettings({
                        ...state.settings,
                        passcodeHash: hashHex,
                        isPasscodeRequired: true
                      });
                      setIsPasscodeRequired(true);
                      setPasscode('');
                      alert("Vault passcode successfully encrypted and deployed.");
                    }}
                    className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-pink-400 font-bold border border-zinc-800 rounded-xl text-xs uppercase"
                  >
                    Save PIN
                  </button>
                </div>
                {state.settings.passcodeHash && (
                  <p className="text-[9px] text-emerald-400 font-bold uppercase mt-1.5 flex items-center gap-1">
                     ✔ Encrypted passcode active
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Destructive state reset */}
          <div className="glass-panel rounded-2xl p-5 border-red-500/10 hover:border-red-500/30">
            <h3 className="text-sm font-bold text-red-400 font-display flex items-center gap-2 border-b border-zinc-900 pb-3 mb-3">
              <ShieldAlert className="w-4 h-4 text-red-400" />
              Destructive Redline Zero
            </h3>
            <p className="text-zinc-500 text-xs leading-relaxed">
              Failing to manage your constraints leads to decay; resetting completely wipes out your entire local history database.
            </p>
            <button
              onClick={handleHardResetPrompt}
              className="w-full mt-4 py-2.5 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold border border-red-500/20 rounded-xl text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" /> Force Database Wipe
            </button>
          </div>

        </div>

      </div>

      <div className="glass-panel rounded-2xl p-5">
        <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
          <Info className="w-4 h-4 text-pink-400" />
          Technical Ledger Specifications
        </h4>
        <p className="text-zinc-500 text-xs leading-relaxed">
          This system stores state variables inside the browser's persistent key-value <strong className="text-zinc-400">LocalStorage Web Storage Sandbox</strong>. Since no centralized third-party servers possess your training records, your credentials and history remain entirely secure, locked-off, private, and localized to your workspace instance. Be sure to export periodic backups before wiping cookies.
        </p>
      </div>
    </div>
  );
};
