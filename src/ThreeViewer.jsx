import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js";
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

export default function ThreeViewer({ file }) {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!file) return;

    const mount = mountRef.current;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x181818);

    const camera = new THREE.PerspectiveCamera(
      45,
      mount.clientWidth / mount.clientHeight,
      0.1,
      100
    );
    camera.position.set(3, 2, 3);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    mount.appendChild(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.3));
    const dir = new THREE.DirectionalLight(0xffffff, 1);
    dir.position.set(5, 10, 7);
    scene.add(dir);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const extension = file.split(".").pop().toLowerCase();
    const path = `/models/${file}`;

    if (extension === "glb" || extension === "gltf") {
      const loader = new GLTFLoader();
      loader.load(path, (g) => scene.add(g.scene));
    }

    else if (extension === "obj") {
      const mtlPath = file.replace(".obj", ".mtl");
      const mtlLoader = new MTLLoader();

      fetch(`/models/${mtlPath}`).then((res) => {
        if (res.ok) {
          mtlLoader.setPath("/models/");
          mtlLoader.load(mtlPath, (materials) => {
            materials.preload();
            const objLoader = new OBJLoader();
            objLoader.setMaterials(materials);
            objLoader.setPath("/models/");
            objLoader.load(file, (obj) => scene.add(obj));
          });
        } else {
          const objLoader = new OBJLoader();
          objLoader.setPath("/models/");
          objLoader.load(file, (obj) => scene.add(obj));
        }
      });
    }

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener("resize", handleResize);
    };
  }, [file]);

  return (
    <div
      ref={mountRef}
      className="w-full h-[75vh] border bg-base-200"
    />
  );
}
