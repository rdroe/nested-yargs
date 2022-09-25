import { ArcRotateCamera } from "@babylonjs/core/Cameras/arcRotateCamera.js"
import { Engine } from "@babylonjs/core/Engines/engine.js"
import { HemisphericLight } from "@babylonjs/core/Lights/hemisphericLight.js"
import { MeshBuilder } from "@babylonjs/core/Meshes/meshBuilder.js"
import { Scene } from "@babylonjs/core/scene.js"
import { Vector3 } from "@babylonjs/core/Maths/math.vector.js"
import "@babylonjs/core/Culling"
import { StandardMaterial } from "@babylonjs/core/Materials/standardMaterial.js"
import { Color3 } from "@babylonjs/core/Maths/math.color.js"
import { Mesh } from "@babylonjs/core/Meshes/mesh.js"

export const getters: {
    scene?: () => Scene & { new: (...args: any[]) => any }
} = {}

export const runRenderLoop = () => {


    let initialized: boolean | undefined
    const element = `<canvas id="view"></canvas>`

    document.body.innerHTML += element
    const view = document.getElementById("view") as HTMLCanvasElement

    const engine = new Engine(view, true)
    const scene = new Scene(engine)

    const camera = new ArcRotateCamera(
        "camera",
        Math.PI / 2,
        Math.PI / 3.2,
        2,
        Vector3.Zero(),
        scene)

    camera.attachControl(view)

    new HemisphericLight(
        "light",
        new Vector3(0, 1, 0),
        scene)


    scene.onPointerDown = function(evt: any, pickResult: any) {
        if (pickResult.hit) {
            // console.log('picked', pickResult.pickedMesh.name)
        }
    };

    const windowResizeListener = () => {
        let windowW, windowH;
        windowW = window.innerWidth;
        windowH = window.innerHeight;
        view.width = windowW;
        view.height = windowH;
    }

    window.addEventListener('resize', windowResizeListener)


    engine.runRenderLoop(() => {
        scene.render();
        if (!initialized) windowResizeListener()
        initialized = initialized ?? true
    })
    getters.scene = () => scene as ReturnType<typeof getters.scene>
}

