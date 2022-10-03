import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js"
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js"
import "@babylonjs/core/Culling"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js"
import { Color3 } from "@babylonjs/core/Maths/math.color.js"
import { getters } from '../ui/engine'
import { Module } from "nyargs"
import { Animation } from "@babylonjs/core"

const makeBox = (
    x: number, y: number, z: number,
    options: {
        id?: string,
        color?: [number, number, number],
        size?: number
        animationPositions?: [number, number, number][]
        animationFrames?: number[]
    }
) => {
    const {
        id: ident = Math.random().toString().split('.')[1],
        color: col = randColor(),
        size = 0.5,
        animationPositions = [],
        animationFrames = []
    } = options

    const mesh = MeshBuilder.CreateBox(ident,
        { size }, getters.scene())
    mesh.position.x = x
    mesh.position.y = y
    mesh.position.z = z
    mesh.isPickable = true
    const color = new StandardMaterial("groundMat");

    color.diffuseColor = new Color3(
        ...col
    );
    mesh.material = color
    let maxFrame = 0

    if (animationPositions.length > 1) {

        const piAnimate = new Animation(`animation-${ident}`, "position", 30, Animation.ANIMATIONTYPE_VECTOR3, Animation.ANIMATIONLOOPMODE_CYCLE);
        const keyFrames = animationFrames.map((turnNum, idx) => {

            const frame = Math.round(turnNum)
            maxFrame = Math.max(maxFrame, frame)
            return {
                frame,
                value: new Vector3(...animationPositions[idx])
            }
        })
        console.log('keyFrames', keyFrames)
        piAnimate.setKeys(keyFrames)
        mesh.animations.push(piAnimate)
        getters.scene().beginAnimation(mesh, 0, maxFrame + 30, true);
    }
}

const randColor = (): [number, number, number] => [
    Math.random(),
    Math.random(),
    Math.random()
]
const frameRegex = /([0-9]+)\=([0-9])\,([0-9])\,([0-9])/
const requireValidFrameArg = (str: string) => {
    if (str.match(frameRegex)) {
        return
    }
    throw new Error(`cli arg ${str} does not match the required pattern for a frame, e.g. 1=0,1,2`)
}

const parseFrameArg = (str: string): [number, [number, number, number]] => {
    requireValidFrameArg(str)
    const [, frame, x, y, z] = str.match(frameRegex)

    return [parseInt(frame), [parseInt(x), parseInt(y), parseInt(z)]]
}


const parseFrames = (frames: string[]) => {
    return frames.reduce((accum, str) => {
        const [frameIdxs, boxPositions] = accum ?? [[], []]
        const [newFrameIdx, newBoxPositions] = parseFrameArg(str)
        return [frameIdxs.concat(newFrameIdx), boxPositions.concat([newBoxPositions])]
    }, [[], []])
}


const box: Module<{ positional: number[], color: [number, number, number], frames: string[] }> = {
    help: {
        description: 'create a colored, optionally animated box onscreen',
        options: {
            'x y z': 'required; these three numbers will be the (start) coordinates of the box presented onscreen',
            color: 'e.g. box ... --color 100 0 100 : 3 numbers should be provided, which will be the rgb of the box presented',
            frames: 'An array of special-form keyframe args, e.g. "box ... --frames 10=1,1,1 20=2,2,2". If you added that argument, the box would begin at its initial position, animate to 1,1,1 by the 10th frame, then to 2,2,2 by its 20th frame '
        },
        examples: {
            '0 0 0': `
Add a box (with some random color) at x,y,z position 0 0 0 (the default origin in Babylon JS).
`,
            '1 2 1 --color 100 100 100': `
Add a white box at x,y,z position 1 2 1.
`,
            '0,0,0 --frames 10=1,1,1 20=2,2,2': 'begin at its initial position (which is 0,0,0) then animate to 1,1,1 by the 10th frame, then to 2,2,2 by its 20th frame. The box would snap back to its origin and restart after some constant number of frames had passed'
        },
    },
    yargs: {
        frames: {
            alias: 'f',
            array: true
        },
        color: {
            alias: 'c',
            array: true,
            type: 'number'
        }
    },

    fn: async ({ positional, color, frames }) => {
        const [x, y, z] = positional
        const [animationFrames = [], animationPositions = []] = frames ? parseFrames([`0=${x},${y},${z}`, ...frames]) : []
        return makeBox(x, y, z, { color, animationFrames, animationPositions })
    },
}

export default box
