function bookingsOverlap(startA, endA, startB, endB){
    return startA < endB && startB < endA;
}

module.exports = {bookingsOverlap};