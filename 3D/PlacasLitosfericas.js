ON_DAED["3D"].PlacasLitosfericas = function (scene) {
    var o = new THREE.Object3D();

    var tamanho = 40;

    var planeta = new THREE.Mesh(new THREE.SphereGeometry(tamanho, 64, 32), new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("lib/on-daed-js/imgs/texturas/terra/map.jpg")
    }));

    o.add(planeta);

    var placas = new THREE.Mesh(new THREE.SphereGeometry(tamanho + 0.5, 64, 32), new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture("lib/on-daed-js/imgs/texturas/terra/placas-litosfericas.png"),
        transparent: true,
        color: 0xFF0000
    }));

    ON_DAED['3D'].register(planeta, placas, function() {
        var cor = placas.material.color;
        cor.g = Math.abs(1 - new Date().getMilliseconds() / 500) * 0.5;
    });

    scene.add(o);

    return o;
};