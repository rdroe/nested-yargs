
const colors: {
    [id: string]: [number, number, number]
} = {

};

const randColor = (): [number, number, number] => [
    Math.random(),
    Math.random(),
    Math.random()
]

export default (id: string): [number, number, number] => {

    if (colors[id]) {
        return colors[id]
    }

    colors[id] = randColor()
    return colors[id]
}
