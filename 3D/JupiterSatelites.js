(function () {

	var UNIT = 1 / 18216;
	var JUPITER_RADIUS = 69911 * UNIT;

	var EARTH_RADIUS = 6371;
	var EARTH_ORBIT_RADIUS = 149597870.7;
	var EARTH_ORBITAL_PERIOD = 365.25;
	var EARTH_ORBITAL_INCLINATION_TO_JUPITER = 7.155 * Math.PI / 180; // in relation to sun's equator
	var AU_KM = EARTH_ORBIT_RADIUS * UNIT;

	var IO_RADIUS = 1821.3 * UNIT;
	var IO_ORBIT_RADIUS = 421769 * UNIT;
	var IO_ORBITAL_PERIOD = 1.769138;
	var IO_ORBIT_INCLINATION = 0.036 * Math.PI / 180;
	var IO_COLOR = 0xFFFF00;

	var EUROPA_RADIUS = 1565 * UNIT;
	var EUROPA_ORBIT_RADIUS = 671079 * UNIT;
	var EUROPA_ORBITAL_PERIOD = 3.551810;
	var EUROPA_ORBIT_INCLINATION = 0.464 * Math.PI / 180;
	var EUROPA_COLOR = 0xffffff;

	var GANYMEDE_RADIUS = 2634 * UNIT;
	var GANYMEDE_ORBIT_RADIUS = 1070042 * UNIT;
	var GANYMEDE_ORBITAL_PERIOD = 7.154553;
	var GANYMEDE_ORBIT_INCLINATION = 0.186 * Math.PI / 180;
	var GANYMEDE_COLOR = 0x00FF00;

	var CALLISTO_RADIUS = 2403 * UNIT;
	var CALLISTO_ORBIT_RADIUS = 1882700 * UNIT;
	var CALLISTO_ORBITAL_PERIOD = 16.6890184;
	var CALLISTO_ORBIT_INCLINATION = 0.281 * Math.PI / 180;
	var CALLISTO_COLOR = 0xFF00FF;

	var SUN_SCALE = 1;

	var SUN_JUPITER_DISTANCE = EARTH_ORBIT_RADIUS * 5.3 * UNIT;

	var SHADOW_PLANE_SIZE = SUN_JUPITER_DISTANCE;

	var TEXTURE_CIRCLE = ThreeHelper.textureCircle();

	function JupiterModelBody(radius, orbitRadius, period, orbitInclination, color) {
		this.t = 0;
		this.originalT = 0;
		this.radius = radius;
		this.orbitRadius = orbitRadius;
		this.orbitInclination = orbitInclination;
		this.period = period;
		this.color = color;
		this.element = null;
	}

	JupiterModelBody.prototype.vectorToParametric = function vectorToParametric(x, y, z) {
		this.originalT = Math.atan2(y, x);

		this.element.position.set(x, 0, y);
	};

	JupiterModelBody.prototype.setPositionByT = function setPositionByT(t) {
		var bufT = (t / this.period) * Math.PI * 2;

		this.t = this.originalT + bufT;
		
		var v = new THREE.Vector3(this.orbitRadius * Math.cos(this.t), 0, this.orbitRadius * Math.sin(this.t));
		
		var vFinal = MathHelper.rotateVector(v, new THREE.Vector3(0, 0, 1), -this.orbitInclination);

		this.element.position.copy(vFinal);
	};

	JupiterModelBody.prototype.initObject3D = function (parent) {
		this.element = new THREE.Object3D();
		var wrapper = new THREE.Object3D();
		wrapper.add(this.element);
		parent.add(wrapper);
	};

	JupiterModelBody.prototype.initMesh = function (texturePath, parent, zRotation) {
		this.element = new THREE.Mesh(
			new THREE.SphereGeometry(this.radius, 64, 32),
			new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture(texturePath)
			})
			);

		this.circleSelection = new THREE.Sprite(new THREE.SpriteMaterial({
			map: TEXTURE_CIRCLE,
			transparent: true,
			depthTest: false,
			color: this.color
		}));

		this.circleSelection.scale.multiplyScalar(5);

		this.element.castShadow = this.element.receiveShadow = true;

		var wrapper = new THREE.Object3D();
		//this.element.add(MathHelper.buildAxes(100));
		//wrapper.rotation.z = zRotation;

		this.element.add(this.circleSelection);
		wrapper.add(this.element);

		parent.add(wrapper);
	};

	JupiterModelBody.prototype.importData = function importData (data) {
		this.vectorToParametric(parseFloat(data.x) * AU_KM, parseFloat(data.y) * AU_KM, parseFloat(data.z) * AU_KM);
		this.t = 0;
	};

	function JupiterSatellites(scene, control) {
		this.scene = scene;
		this.control = control;
		this.wrapper = new THREE.Object3D();

		//this.wrapper.add(MathHelper.buildAxes(1000));
		this.wrapper.rotation.x = Math.PI / 2;

		this.tracer = null;
		this.satellites = [];

		this.t = 0;
		this.epochDate = 0;

		this.cameraLocked = false;
		this.started = false;

		this.addJupiter();
		this.sun = this.addSun();
		this.sun.visible = false;
		this.addSatellites();
		this.addEarth(this.jupiter);

		//this.wrapper.add(MathHelper.buildAxes(1000));

		this.registerSceneElement(scene);
	}
	
    JupiterSatellites.prototype.getSatelliteColors = function () {
        var colors = [];
        
        colors.push(IO_COLOR.toString(16));
        colors.push(EUROPA_COLOR.toString(16));
        colors.push(GANYMEDE_COLOR.toString(16));
        colors.push(CALLISTO_COLOR.toString(16));
        
        var ret = {};
        
        for(var i = 0; i < colors.length; i++) {
            var idx = new String(i + 1);
            ret[idx] = "";
            var max = 6 - colors[i].length;
            for(var j = 0; j < max; j++) {
                ret[idx] += "0"; 
            }
            ret[idx] += colors[i];
            ret[idx] = '#' + ret[idx]; 
        }
        
        return ret;
    };
    
	JupiterSatellites.prototype.updateFromData = function updateFromData (data) {
		var s = this.sun;
		var e = this.earth;
		
		var sunResults = data.results[0];
		s.position.set(parseFloat(sunResults.x), -parseFloat(sunResults.z), parseFloat(sunResults.y));
		s.position.multiplyScalar(AU_KM);

		for(var i = 1; i <= 4; i++) {
			this.satellites[i - 1].importData(data.results[i]);
		}

		e.importData(data.results[5]);
	};

	JupiterSatellites.prototype.registerSceneElement = function (scene) {

		var o = this;

		ON_DAED['3D'].register(scene, this.wrapper, function () {
			if (o.started) {
				if (o.cameraLocked) {
					o.control.enableRotate =
					o.control.enablePan =
					o.control.enableKeys = false;
                    o.updateCameraFromPosition();
				} else {
					o.control.enableRotate =
					o.control.enablePan =
					o.control.enableKeys = true;
				}
			}
		});
		
	};

	JupiterSatellites.prototype.fetchNetworkData = function fetchNetworkData(url, callback) {

		var getSDM = new XMLHttpRequest();
		getSDM.onreadystatechange = function (data) {
			if (getSDM.readyState == 4 && getSDM.status == 200) {
				if (callback instanceof Function) {
					callback(JSON.parse(getSDM.responseText));
				}
			}
		};

		getSDM.open("GET", url, true);
		getSDM.send();
	};

	var TRACE_V_STEP = 0.025;

	JupiterSatellites.prototype.addSatellites = function () {
		this.tracer = new PhysWrapperTrace(500, 0, TRACE_V_STEP * 20, 0);

		this.wrapper.add(this.tracer);

		var IO = new JupiterModelBody(IO_RADIUS, IO_ORBIT_RADIUS, IO_ORBITAL_PERIOD, IO_ORBIT_INCLINATION, IO_COLOR);
		IO.initMesh('lib/on-daed-js/imgs/texturas/satelites/io.jpg', this.jupiter);
		var x = 2.994183236154027E-04 * AU_KM;
		var y = -2.809389273056349E-03 * AU_KM;
		var z = -9.525760463609053E-05 * AU_KM;
		IO.vectorToParametric(x, y, z);

		this.satellites.push(IO);

		this.tracer.addTracingLine(IO.element, IO_COLOR);

		var EUROPA = new JupiterModelBody(EUROPA_RADIUS, EUROPA_ORBIT_RADIUS, EUROPA_ORBITAL_PERIOD, EUROPA_ORBIT_INCLINATION, EUROPA_COLOR);
		EUROPA.initMesh('lib/on-daed-js/imgs/texturas/satelites/europa.jpg', this.jupiter);
		var x = -4.225204973454476E-03 * AU_KM;
		var y = 1.455042185336467E-03 * AU_KM;
		var z = -2.034089333849075E-05 * AU_KM;
		EUROPA.vectorToParametric(x, y, z);

		this.satellites.push(EUROPA);

		this.tracer.addTracingLine(EUROPA.element, EUROPA_COLOR);

		var GANYMEDE = new JupiterModelBody(GANYMEDE_RADIUS, GANYMEDE_ORBIT_RADIUS, GANYMEDE_ORBITAL_PERIOD, GANYMEDE_ORBIT_INCLINATION, GANYMEDE_COLOR);
		GANYMEDE.initMesh('lib/on-daed-js/imgs/texturas/satelites/ganymede.jpg', this.jupiter);
		var x = -6.923432356916074E-03 * AU_KM;
		var y = -1.815842447905196E-03 * AU_KM;
		var z = -1.446996387050033E-04 * AU_KM;
		GANYMEDE.vectorToParametric(x, y, z);

		this.satellites.push(GANYMEDE);

		this.tracer.addTracingLine(GANYMEDE.element, GANYMEDE_COLOR);

		var CALLISTO = new JupiterModelBody(CALLISTO_RADIUS, CALLISTO_ORBIT_RADIUS, CALLISTO_ORBITAL_PERIOD, CALLISTO_ORBIT_INCLINATION, CALLISTO_COLOR);
		CALLISTO.initMesh('lib/on-daed-js/imgs/texturas/satelites/callisto.jpg', this.jupiter);
		var x = 4.451900573111861E-03 * AU_KM;
		var y = 1.173723889040994E-02 * AU_KM;
		var z = 4.419630575197735E-04 * AU_KM;
		CALLISTO.vectorToParametric(x, y, z);

		this.satellites.push(CALLISTO);

		this.tracer.addTracingLine(CALLISTO.element, CALLISTO_COLOR);
	};

	JupiterSatellites.prototype.setCameraPosition = function setCameraPosition(camera, pos) {
		var p = pos.clone();

		camera.position.copy(p);

		camera.lookAt(new THREE.Vector3(0, 0, 0));
		
		camera.fov = 0.208;
		camera.updateProjectionMatrix();
	};

	JupiterSatellites.prototype.traceLines = function (oT) {

		oT = oT || 0;

		var max = 5;
		var step = TRACE_V_STEP;

		this.update(oT + -max);
		this.tracer.initTrace();

		for (var t = -max + step; t < max; t = t + step) {
			this.update(oT + t);
			this.tracer.updateTrace();
		}

		this.update(oT);

		this.tracer.position.y /= 2;
		this.tracer.position.y += TRACE_V_STEP * 4;
	};

    JupiterSatellites.prototype.setCameraDataCallback = function setCameraDataCallback(cb) {
        this.cameraDataCallback = cb;
    };

    JupiterSatellites.prototype.updateCameraFromPosition = function() {
        if(this.cameraDataCallback instanceof Function) {
            var data = this.cameraDataCallback();
            var jd = data.jd;
            var long = data.long * Math.PI / 180;
            var lat = data.lat * Math.PI / 180;
            
 //           console.log(long, lat);
            
            var ts = ON_DAED.ASTRO.getSiderealTimeFromJulian(jd);
            
//            var angle = -Math.PI - ts.apparentSiderealTime * 15 * (Math.PI / 180) - long;
            var angle = lat - Math.PI / 2;
            
//            var v = MathHelper.rotateVector(new THREE.Vector3(0, 1, 0), new THREE.Vector3(0, 0, 1), angle);
 //           this.control.object.up.copy(v);
            
            
            //this.control.object.z = -Math.PI - ts.apparentSiderealTime * 15 * (Math.PI / 180) - long;
            //console.log(long);
            //firmamentoB.rotation.z = latitudeUsuario - Math.PI / 2;
        }
    };

	JupiterSatellites.prototype.addJupiter = function () {
		this.jupiter = new THREE.Mesh(
			new THREE.SphereGeometry(JUPITER_RADIUS, 64, 32),
			new THREE.MeshLambertMaterial({
				map: THREE.ImageUtils.loadTexture('lib/on-daed-js/imgs/texturas/planetas/jupiter.jpg')
			})
			);

		this.wrapper.add(this.jupiter);
	};

	JupiterSatellites.prototype.update = function (t, updateTraceHeight) {

		for (var i = 0; i < this.satellites.length; i++) {
			var sat = this.satellites[i];
			sat.setPositionByT(t);
		}

		this.earth.setPositionByT(t);
		
		//this.setEarthCameraPos();
	};

	JupiterSatellites.prototype.addEarth = function (parent, earthData) {
		var control = this.control;

		var x = -1.685246489174995E-01 * AU_KM;
		var y = -4.120973411130758E-06 * AU_KM;
		var z = 9.687833048228511E-01 * AU_KM;

		var EARTH = new JupiterModelBody(0, AU_KM, EARTH_ORBITAL_PERIOD, 0, 0);
		EARTH.initObject3D(parent);
		EARTH.vectorToParametric(x, y, z);

		this.earth = EARTH;
	};

	JupiterSatellites.prototype.setSunCameraPos = function () {
		var pos = new THREE.Vector3(0, 0, 0);
		this.sun.localToWorld(pos);
		this.setCameraPosition(this.control.object, pos);
	};

	JupiterSatellites.prototype.setEarthCameraPos = function () {
		var pos = new THREE.Vector3(0, 0, 0);
		this.earth.element.localToWorld(pos);
		this.setCameraPosition(this.control.object, pos);
	};

	JupiterSatellites.prototype.addSun = function () {
		ON_DAED["3D"].ativarFlaresSol();

		var light = new THREE.DirectionalLight(0xFFFFFF, 1);

		light.shadowCameraLeft = -SHADOW_PLANE_SIZE;
		light.shadowCameraRight = SHADOW_PLANE_SIZE;
		light.shadowCameraTop = SHADOW_PLANE_SIZE;
		light.shadowCameraBottom = -SHADOW_PLANE_SIZE;

		light.shadowDarkness = 0.5;

		light.shadowCameraNear = 1;
		light.shadowCameraFar = SHADOW_PLANE_SIZE * 4;

		light.shadowMapWidth = 2048;
		light.shadowMapHeight = 2048;

		light.target = this.jupiter;

		light.castShadow = true;

		var lightHelper = new THREE.CameraHelper(light.shadow.camera);
		//this.scene.add(lightHelper);

		this.jupiter.receiveShadow = true;
		this.jupiter.castShadow = true;

		var wrapperSol = new THREE.Object3D();
		var sol = ON_DAED["3D"].criarSol(wrapperSol);

		sol.scale.multiplyScalar(SUN_SCALE);

		ON_DAED['3D'].register(this.scene, light, function () {
			light.position.copy(sol.localToWorld(sol.position.clone()));
		});

		sol.position.set(-4.003460455018916E+00, 1.018232818636885E-01, -2.935353231225851E+00);
		sol.position.multiplyScalar(AU_KM);

		wrapperSol.rotation.z = EARTH_ORBITAL_INCLINATION_TO_JUPITER - 6.09 * Math.PI / 180;

		this.wrapper.add(wrapperSol);

		return sol;
	};

	ON_DAED["3D"].JupiterSatelites = JupiterSatellites;

})();