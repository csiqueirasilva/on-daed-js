ON_DAED["3D"].JupiterSatelites = function (scene) {
	
	var UNIT = 1 / 18216;
	var JUPITER_RADIUS = 69911 * UNIT;
	
	var IO_RADIUS = 1821.6 * UNIT;
	var IO_ORBIT_RADIUS = 421700 * UNIT;

	var EUROPA_RADIUS = 1560.8 * UNIT;
	var EUROPA_ORBIT_RADIUS = 670900 * UNIT;
	
	var GANYMEDE_RADIUS = 2634.1 * UNIT;
	var GANYMEDE_ORBIT_RADIUS = 1070400 * UNIT;
	
	var CALLISTO_RADIUS = 2410.3 * UNIT;
	var CALLISTO_ORBIT_RADIUS = 1882700 * UNIT;
	
	var o = {};

	var wrapper = new THREE.Object3D();
	
	var jupiter = new THREE.Mesh(
		new THREE.SphereGeometry(JUPITER_RADIUS, 64, 32),
		new THREE.MeshLambertMaterial({
			map: THREE.ImageUtils.loadTexture('imgs/texturas/planetas/jupiter.jpg')
		})
	);

	wrapper.add(jupiter);

	ON_DAED["3D"].ativarFlaresSol();

	var light = new THREE.DirectionalLight(0xFFFFFF, 1);
	
	var shadowPlaneSize = 100;
	
	light.shadowCameraLeft = -shadowPlaneSize;
	light.shadowCameraRight = shadowPlaneSize;
	light.shadowCameraTop = shadowPlaneSize;
	light.shadowCameraBottom = -shadowPlaneSize;

	light.shadowDarkness = 0.5;

	light.shadowCameraNear = 1;
	light.shadowCameraFar = shadowPlaneSize * 2;

	light.shadowMapWidth = 2048;
	light.shadowMapHeight = 2048;
	
	light.target = jupiter;
	
	light.castShadow = true;
	
	var lightHelper = new THREE.CameraHelper( light.shadow.camera );
	scene.add(lightHelper);
	
	jupiter.receiveShadow = true;
	jupiter.castShadow = true;
	
	var sol = ON_DAED["3D"].criarSol(wrapper);

	var SUN_SCALE = (1 / 90);

	sol.scale.multiplyScalar( SUN_SCALE );

	ON_DAED['3D'].register(scene, light, function() {
		light.position.copy(sol.localToWorld(sol.position.clone()));
	});

	light.position.copy(sol.position);

	sol.position.set(90, 0, 0);

	wrapper.add(MathHelper.buildAxes(1000));

	scene.add(wrapper);

	return o;
};