// Fonction pour vérifier si un cours est dans un créneau horaire
export const isTimeInSlot = (courseStart, courseEnd, slotStart, slotEnd) => {
  // Convertir les heures en minutes pour faciliter la comparaison
  const convertToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  const courseStartMinutes = convertToMinutes(courseStart);
  const courseEndMinutes = convertToMinutes(courseEnd);
  const slotStartMinutes = convertToMinutes(slotStart);
  const slotEndMinutes = convertToMinutes(slotEnd);

  // Un cours est dans un créneau si son début est dans le créneau
  // ou si son créneau chevauche le créneau
  const result =
    (courseStartMinutes >= slotStartMinutes && courseStartMinutes < slotEndMinutes) ||
    (courseStartMinutes <= slotStartMinutes && courseEndMinutes > slotStartMinutes);

  console.log('-> Result:', result);

  return result;
};