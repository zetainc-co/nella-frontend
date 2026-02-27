'use client'
import { Send, Loader2, Mic, Image, Smile } from 'lucide-react'
import { useMessageInput } from '../../hooks/use-message-input'
import type { MessageInputProps } from '../../types'

export function MessageInput({
  onSend,
  isPending,
  disabled,
}: MessageInputProps) {
  const {
    value,
    setValue,
    isFocused,
    setIsFocused,
    textareaRef,
    handleSend,
    handleKeyDown,
    handleInput,
  } = useMessageInput({ onSend, isPending })

  return (
    <div className="px-6 py-4 border-t border-white/[0.06] bg-[#0a0a0a]">

      <div className="flex items-center gap-4">

        {/* Left Actions - Outside input */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="
              w-9 h-9
              flex items-center justify-center
              text-[#f0f4ff]/40
              hover:text-[#9EFF00]
              hover:bg-[#9EFF00]/10
              rounded-lg
              transition-colors
              cursor-pointer
            "
            aria-label="Grabar audio"
          >
            <Mic className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="
              w-9 h-9
              flex items-center justify-center
              text-[#f0f4ff]/40
              hover:text-[#9EFF00]
              hover:bg-[#9EFF00]/10
              rounded-lg
              transition-colors
              cursor-pointer
            "
            aria-label="Adjuntar imagen"
          >
            <Image className="w-5 h-5" />
          </button>

          <button
            type="button"
            className="
              w-9 h-9
              flex items-center justify-center
              text-[#f0f4ff]/40
              hover:text-[#9EFF00]
              hover:bg-[#9EFF00]/10
              rounded-lg
              transition-colors
              cursor-pointer
            "
            aria-label="Insertar emoji"
          >
            <Smile className="w-5 h-5" />
          </button>
        </div>

        {/* Input Container */}
        <div className={`
          flex-1
          flex items-center gap-3
          px-4 py-2.5
          bg-[#1a1a1a]
          border rounded-xl
          transition-all duration-200
          ${isFocused
            ? 'border-[#9EFF00]/30'
            : 'border-white/[0.08]'
          }
        `}>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onInput={handleInput}
            disabled={disabled || isPending}
            placeholder="Escribe un mensaje..."
            rows={1}
            aria-label="Mensaje"
            className="
              flex-1
              bg-transparent
              border-none
              outline-none
              resize-none
              text-sm text-[#f0f4ff]
              placeholder:text-[#f0f4ff]/30
              leading-normal
              max-h-[120px]
              overflow-auto
              py-1
              scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent
            "
          />

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || isPending || disabled}
            aria-label="Enviar mensaje"
            className={`
              w-9 h-9
              rounded-lg
              flex items-center justify-center
              flex-shrink-0
              transition-all duration-200
              ${value.trim() && !isPending
                ? 'bg-[#9EFF00] hover:bg-[#8FEF00] cursor-pointer shadow-lg shadow-[#9EFF00]/20'
                : 'bg-[#9EFF00]/15 cursor-not-allowed'
              }
            `}
          >
            {isPending ? (
              <Loader2 className="w-4 h-4 text-[#9EFF00] animate-spin" />
            ) : (
              <Send className={`
                w-4 h-4
                ${value.trim() ? 'text-[#0a0a0a]' : 'text-[#9EFF00]/50'}
              `} />
            )}
          </button>
        </div>

      </div>

      {/* Helper Text */}
      <p className="mt-2 text-right text-[10px] text-[#f0f4ff]/20">
        Enter para enviar · Shift+Enter nueva línea
      </p>
    </div>
  )
}
