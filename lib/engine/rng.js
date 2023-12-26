
/**
 * Get a random ordered version of an array.
 * @param {Array} array Array to shuffle.
 * @returns {Array} Returns the same array in random order.
 */
export function shuffle(array) {

    // fisher-yates shuffle
    let currentIndex = array.length,
    randomIndex

    // While there remain elements to shuffle.
    while (currentIndex != 0) {
    // Pick a remaining element.
    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex--

    // And swap it with the current element.
    [array[currentIndex], array[randomIndex]] = [
        array[randomIndex],
        array[currentIndex],
    ]
    }

    return array
}
