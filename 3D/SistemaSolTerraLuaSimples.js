ON_DAED['3D'].SistemaSolTerraLuaSimples = function (scene) {

    var wrapper = new THREE.Object3D();

    var raioTerra = 40;

    var lua = new THREE.Mesh(
            new THREE.SphereGeometry(raioTerra / 4, 64, 32),
            new THREE.MeshLambertMaterial({
                map: THREE.ImageUtils.loadTexture("lib/on-daed-js/imgs/texturas/lua/lua-new.jpg")
            })
            );

    var objetoLua = new THREE.Object3D();

    lua.position.x = raioTerra * 3;

    objetoLua.add(lua);
    objetoLua.rotation.x = 11 * Math.PI / 180;

    var objetoSol = ON_DAED["3D"].criarSol(raioTerra * 2, wrapper);

    var texturaTerra = THREE.ImageUtils.loadTexture('lib/on-daed-js/imgs/texturas/terra/map.jpg');

    var terra = new THREE.Mesh(new THREE.SphereGeometry(raioTerra, 64, 32), new THREE.MeshLambertMaterial({map: texturaTerra}));

    var terraRot = new THREE.Object3D();
    terraRot.rotation.z = -23.4 * Math.PI / 180;
    terraRot.add(terra);

    var objetoTerra = new THREE.Object3D();
    objetoTerra.add(terraRot);
    objetoTerra.position.x = raioTerra * 10;

    objetoTerra.add(objetoLua);

    objetoSol.add(objetoTerra);

    var luzTerra = new THREE.DirectionalLight(0xF0F0F0, 1);

//    debug

//    luzTerra.shadowCameraLeft = -raioTerra * 12;
//    luzTerra.shadowCameraRight = raioTerra * 12;
//    luzTerra.shadowCameraTop = raioTerra * 12;
//    luzTerra.shadowCameraBottom = -raioTerra * 12;
//    luzTerra.shadowCameraVisible = true;
//
//    luzTerra.castShadow = true;

    var parentScene = scene;

    while (!(parentScene instanceof THREE.Scene)) {
        parentScene = parentScene.parent;
    }

    luzTerra.target = objetoTerra;

    parentScene.add(luzTerra);

    var wrapperSistema = new THREE.Object3D();
    
    wrapperSistema.add(wrapper);
    
    ON_DAED['3D'].register(scene, wrapperSistema, function () {
        if (wrapper.visible) {
            luzTerra.visible = true;

            terra.rotation.y += 0.01;
            objetoLua.rotation.y += 0.025;
            objetoSol.rotation.y -= 0.01;
            objetoTerra.rotation.y = -objetoSol.rotation.y;
            
            wrapper.updateMatrixWorld();
            var pos = new THREE.Vector3();

            pos.setFromMatrixPosition(objetoSol.matrixWorld);
            luzTerra.position.copy(pos);

            pos.setFromMatrixPosition(objetoTerra.matrixWorld);
            luzTerra.lookAt(pos);
        } else {
            luzTerra.visible = false;
        }
    });
    
    wrapper.scale.multiplyScalar(1/10);

    return wrapper;
};