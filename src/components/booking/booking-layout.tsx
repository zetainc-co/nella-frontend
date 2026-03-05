'use client';

import { useState, useEffect } from 'react';
import { AuthBackground, AuthBranding } from '@/modules/auth/components/shared';
import { AgentInfoPanel } from './agent-info-panel';
import { CalendarPicker } from './calendar-picker';
import { TimeSlots } from './time-slots';
import { BookingConfirmation } from './booking-confirmation';
import { getBookingData, confirmBooking, BookingApiError } from '@/lib/booking-service';
import type { BookingDataResponse, BookingConfirmResponse, BookingErrorCode } from '@/types/booking';

interface BookingLayoutProps {
  token: string;
}

export function BookingLayout({ token }: BookingLayoutProps) {
  const [loadState, setLoadState] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [loadError, setLoadError] = useState<BookingErrorCode | null>(null);
  const [bookingData, setBookingData] = useState<BookingDataResponse | null>(null);

  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedUtcSlot, setSelectedUtcSlot] = useState<string | null>(null);

  const [confirming, setConfirming] = useState(false);
  const [slotConflict, setSlotConflict] = useState(false);
  const [confirmError, setConfirmError] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<BookingConfirmResponse | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBookingData() {
      try {
        const fetchedData = await getBookingData(token);
        if (!cancelled) {
          setBookingData(fetchedData);
          setLoadState('loaded');
        }
      } catch (fetchError) {
        if (!cancelled) {
          const errorCode = fetchError instanceof BookingApiError
            ? fetchError.code
            : 'UNKNOWN_ERROR';
          setLoadError(errorCode as BookingErrorCode);
          setLoadState('error');
        }
      }
    }

    loadBookingData();
    return () => { cancelled = true; };
  }, [token]);

  async function refreshAvailability() {
    try {
      const freshData = await getBookingData(token);
      setBookingData(freshData);
      setSelectedDate(null);
      setSelectedUtcSlot(null);
    } catch {
      // Si el refresh falla, mantener los datos actuales
    }
  }

  function handleSelectDate(dateString: string) {
    setSelectedDate(dateString);
    setSelectedUtcSlot(null);
    setSlotConflict(false);
    setConfirmError(null);
  }

  async function handleConfirm() {
    if (!selectedDate || !selectedUtcSlot) return;
    setConfirming(true);
    setSlotConflict(false);
    setConfirmError(null);

    const scheduledAt = `${selectedDate}T${selectedUtcSlot}:00Z`;

    try {
      const confirmResult = await confirmBooking(token, scheduledAt);
      setConfirmedData(confirmResult);
    } catch (confirmationError) {
      if (confirmationError instanceof BookingApiError) {
        if (confirmationError.code === 'SLOT_NOT_AVAILABLE') {
          setSlotConflict(true);
          await refreshAvailability();
        } else {
          setConfirmError('Ocurrio un error al confirmar. Por favor intenta de nuevo.');
        }
      } else {
        setConfirmError('Ocurrio un error al confirmar. Por favor intenta de nuevo.');
      }
    } finally {
      setConfirming(false);
    }
  }

  const hasAvailability = bookingData
    ? Object.keys(bookingData.availability).length > 0
    : false;

  return (
    <AuthBackground>
      <div className="h-screen overflow-y-auto">
        <div className="flex min-h-full flex-col items-center justify-center px-4 py-10">
          <div className="w-full max-w-4xl" style={{ animation: 'fadeIn 0.35s ease-out' }}>

            {/* Logo */}
            <div className="mb-6">
              <AuthBranding subtitle="Agenda tu reunion" />
            </div>

            {/* Estado: Cargando */}
            {loadState === 'loading' && (
              <BookingCard>
                <div className="flex items-center justify-center py-20">
                  <div className="flex flex-col items-center gap-4">
                    <div
                      className="animate-spin rounded-full"
                      style={{
                        width: 40,
                        height: 40,
                        border: '3px solid rgba(255,255,255,0.1)',
                        borderTopColor: '#9EFF00',
                      }}
                    />
                    <span className="text-sm" style={{ color: 'rgba(240,244,255,0.45)' }}>
                      Cargando disponibilidad...
                    </span>
                  </div>
                </div>
              </BookingCard>
            )}

            {/* Estado: Error de carga */}
            {loadState === 'error' && (
              <BookingCard>
                <BookingErrorScreen code={loadError} />
              </BookingCard>
            )}

            {/* Estado: Cargado */}
            {loadState === 'loaded' && bookingData && (
              <>
                {/* Sin disponibilidad y sin confirmacion previa */}
                {!hasAvailability && !confirmedData && (
                  <BookingCard>
                    <BookingErrorScreen code="NO_AVAILABILITY" />
                  </BookingCard>
                )}

                {/* Flujo normal con disponibilidad */}
                {hasAvailability && (
                  <div
                    className="rounded-2xl overflow-hidden backdrop-blur-sm"
                    style={{
                      background: 'rgba(30,30,30,0.92)',
                      border: '1px solid rgba(255,255,255,0.07)',
                      boxShadow: '0 8px 40px -8px rgba(0,0,0,0.7)',
                    }}
                  >
                    <div className="flex flex-col md:flex-row">

                      {/* Panel izquierdo -- Info del agente */}
                      <div className="md:w-72 shrink-0 border-b border-white/[0.06] md:border-b-0 md:border-r md:border-white/[0.06]">
                        <AgentInfoPanel
                          agent={{
                            name: bookingData.agentName,
                            role: bookingData.agentRole,
                            initials: bookingData.agentInitials,
                            duration: bookingData.durationMin,
                            platform: bookingData.platform,
                          }}
                          lead={{ name: bookingData.leadName }}
                        />
                      </div>

                      {/* Panel derecho -- Calendario + Slots + Confirmacion */}
                      <div className="flex-1 flex flex-col">
                        {confirmedData ? (
                          <BookingConfirmation
                            confirmData={confirmedData}
                            leadName={bookingData.leadName}
                          />
                        ) : (
                          <>
                            <CalendarPicker
                              availability={bookingData.availability}
                              selectedDate={selectedDate}
                              onSelectDate={handleSelectDate}
                              onMonthChange={() => {
                                setSelectedDate(null)
                                setSelectedUtcSlot(null)
                              }}
                            />

                            {selectedDate && (
                              <>
                                <TimeSlots
                                  utcSlots={bookingData.availability[selectedDate] ?? []}
                                  selectedUtcSlot={selectedUtcSlot}
                                  onSelectSlot={setSelectedUtcSlot}
                                  selectedDate={selectedDate}
                                />

                                {/* Mensaje de conflicto de horario */}
                                {slotConflict && (
                                  <div
                                    className="mx-6 md:mx-8 mb-3 rounded-lg px-4 py-3 text-sm"
                                    style={{
                                      background: 'rgba(255,80,80,0.1)',
                                      border: '1px solid rgba(255,80,80,0.3)',
                                      color: 'rgba(255,140,140,1)',
                                    }}
                                  >
                                    Este horario ya fue tomado. Por favor selecciona otro.
                                  </div>
                                )}
                              </>
                            )}

                            {selectedUtcSlot && (
                              <div
                                className="px-6 pb-6 md:px-8 md:pb-8"
                                style={{ animation: 'fadeIn 0.2s ease-out' }}
                              >
                                {confirmError && (
                                  <p className="text-sm mb-3" style={{ color: 'rgba(255,140,140,1)' }}>
                                    {confirmError}
                                  </p>
                                )}
                                <button
                                  onClick={handleConfirm}
                                  disabled={confirming}
                                  className="btn-primary"
                                  style={{ opacity: confirming ? 0.7 : 1 }}
                                >
                                  {confirming ? 'Confirmando...' : 'Confirmar reunion'}
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Footer */}
            <p
              className="text-center text-xs mt-4"
              style={{ color: 'rgba(240,244,255,0.25)' }}
            >
              Powered by <span style={{ color: 'rgba(158,255,0,0.6)' }}>NellaSales</span>
            </p>
          </div>
        </div>
      </div>
    </AuthBackground>
  );
}

function BookingCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="rounded-2xl overflow-hidden backdrop-blur-sm"
      style={{
        background: 'rgba(30,30,30,0.92)',
        border: '1px solid rgba(255,255,255,0.07)',
        boxShadow: '0 8px 40px -8px rgba(0,0,0,0.7)',
      }}
    >
      {children}
    </div>
  );
}

function BookingErrorScreen({ code }: { code: BookingErrorCode | 'NO_AVAILABILITY' | null }) {
  const errorConfig: Record<string, { title: string; message: string; icon: string }> = {
    INVITATION_NOT_FOUND: {
      title: 'Enlace no valido',
      message: 'El enlace no existe o ya fue utilizado.',
      icon: '\uD83D\uDD17',
    },
    INVITATION_EXPIRED: {
      title: 'Enlace expirado',
      message: 'Este enlace ha expirado o la cita ya fue agendada.',
      icon: '\u23F0',
    },
    TENANT_NOT_FOUND: {
      title: 'Enlace no valido',
      message: 'El enlace no es valido.',
      icon: '\uD83D\uDD17',
    },
    NO_AVAILABILITY: {
      title: 'Sin disponibilidad',
      message: 'No hay horarios disponibles en este momento. Por favor contacta al equipo.',
      icon: '\uD83D\uDCC5',
    },
    NETWORK_ERROR: {
      title: 'Error de conexion',
      message: 'No se pudo conectar. Por favor revisa tu conexion e intenta de nuevo.',
      icon: '\uD83D\uDCE1',
    },
    UNKNOWN_ERROR: {
      title: 'Error',
      message: 'Ocurrio un error. Por favor intenta de nuevo.',
      icon: '\u26A0\uFE0F',
    },
    SLOT_NOT_AVAILABLE: {
      title: 'Horario no disponible',
      message: 'Este horario ya fue tomado. Por favor selecciona otro.',
      icon: '\uD83D\uDCC5',
    },
  };

  const resolvedCode = code ?? 'UNKNOWN_ERROR';
  const { title, message, icon } = errorConfig[resolvedCode] ?? errorConfig.UNKNOWN_ERROR;

  return (
    <div className="flex flex-col items-center gap-4 p-12 text-center">
      <span className="text-4xl">{icon}</span>
      <div>
        <h2 className="text-lg font-semibold" style={{ color: '#f0f4ff' }}>
          {title}
        </h2>
        <p className="text-sm mt-2" style={{ color: 'rgba(240,244,255,0.5)' }}>
          {message}
        </p>
      </div>
    </div>
  );
}
