const { transformEvent, transformBooking } = require("./merge");
const Booking = require("../../models/booking");
const Event = require("../../models/event");

module.exports = {
  bookings: async () => {
    try {
      const bookings = await Booking.find();
      console.log(bookings);
      return bookings.map(booking => {
        return transformBooking(booking);
      });
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  bookEvent: async args => {
    try {
      const fetchedEvent = await Event.findOne({ _id: args.eventId });
      const booking = new Booking({
        user: "5d7a44913b141610ec10d987",
        event: fetchedEvent
      });

      const result = await booking.save();

      return transformBooking(result);
    } catch (err) {
      console.log("result:", err);
      throw err;
    }
  },
  cancelBooking: async args => {
    try {
      const booking = await Booking.findOne({ _id: args.bookingId }).populate(
        "event"
      );
      const event = transformEvent(booking.event);
      await Booking.deleteOne({ _id: args.bookingId });
      return event;
    } catch (err) {
      throw err;
    }
  }
};
