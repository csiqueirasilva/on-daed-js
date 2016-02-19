ON_DAED['3D'].AnimacaoPiramideIdle = function (scene, autoTransicao, notUseKeys) {

    var YDifference = -84;
    var delayTransicao = !autoTransicao ? Math.Infinity : 5 * 1E3;
    var timestamp = 0;
    var ultTimestamp = 0;
    var current = 0;
    var ultDataUsuario = {"head": [0, 0, 0], "torso": [0, 0, 0], "leftHand": [0, 0, 0], "rightHand": [0, 0, 0], "t": 0};
    var dataUsuarioDelay = {"head": [0, 0, 0], "torso": [0, 0, 0], "leftHand": [0, 0, 0], "rightHand": [0, 0, 0], "t": 0};
    var delayGesto = 96;
    var userLeftHandSpeed = new THREE.Euler(0, 0, 0);
    var rotationInteractionSpeed = 0.01;
    var blockSpeedDistance = 0.30;

    var usuarioDetectadoAudio = null;
    var usuarioDetectado = false;
    var fadeOutTimer = null;

    var audioTransicao = null;

    var rotated = false;

    // idle
    var incrementoAnimacao = 0.012;

    // OBJECTS
    var obj = [];

    var group = new THREE.Object3D();
    group.position.y = YDifference;

    scene.add(group);

    var posObject = new THREE.Object3D();
    var rotY = new THREE.Object3D();
    var rotX = new THREE.Object3D();
    rotY.add(rotX);
    posObject.add(rotY);
    group.add(posObject);

    // AXIS
    var axis = MathHelper.buildAxes(10000);
    group.add(axis);
    axis.visible = false;

    var labelClassesCantos = ['label-topo-direita', 'label-topo-esquerda', 'label-baixo-esquerda', 'label-baixo-direita'];
    var cantosRotation = [-90, -180, -270, 0];
    var labelCantosIdx = 0;

    /* Problema no controle de fluxo de usuários, tentativa de forçar estado para sempre estar pronto */
    function reiniciarAudios() {
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].a) {
                if (verificarAudioPronto(obj[i].a)) {
                    obj[i].a.pause();
                    obj[i].a.currentTime = 0;
                } else {
                    console.log("Estado do audio inválido: ", obj[i].a.readyState);
                }
            }
        }
    }
    
    function verificarAudioPronto(audio) {
        return audio.readyState === 4 || audio.readyState === 1;
    }

    if (!notUseKeys) {
        $("body").bind("keyup", function (e) {
            var value = String.fromCharCode(e.keyCode).toLowerCase();
            if (value === 'a') {
                axis.visible = !axis.visible;
            } else if (value === 's') {

                $('#label-model')[0].className = "";
                document.body.className = "";

                if (!rotated) {
                    $("#campo-de-observacao").css({
                        "transform": "rotate(45deg) scaleX(-1)"
                    });

                    $('body').addClass("piramide-normal");
                    $("#label-model").addClass("label");

                    rotated = true;
                } else {
                    $("#campo-de-observacao").css({
                        "transform": "scaleX(-1)"
                    });

                    labelCantosIdx = 0;

                    $('body').addClass("piramide-cantos");
                    $("#label-model").addClass(labelClassesCantos[labelCantosIdx]);

                    rotated = false;
                }

            } else if (value === 'd') {
                if ($('body').hasClass('piramide-cantos')) {
                    $('#label-model')[0].className = "";

                    labelCantosIdx = (++labelCantosIdx % labelClassesCantos.length);

                    $("#label-model").addClass(labelClassesCantos[labelCantosIdx]);

                    $('#label-model').show();
                    clearTimeout(fadeOutTimer);
                    fadeOutTimer = setTimeout(function () {
                        $('#label-model').hide();
                    }, 3750);
                }
            } else if (value === 'f') {
                clearTimeout(fadeOutTimer);
                $('#label-model').toggle();
            } else if (value === 'g') {
                o.setUsuarioDetectado(!usuarioDetectado);
            } else if (value === 'z') {
                transicaoModelo(true);
            } else if (value === 'x') {
                transicaoModelo();
            }

        });
    }

    $('#load-modal').data('beforeReady').push(function () {
        for (var i = 0; i < obj.length; i++) {
            if (obj[i].o.parent) {
                obj[i].o.parent.remove(obj[i].o);
            }
            rotX.add(obj[i].o);
            obj[i].o.visible = false;
        }

        if (obj.length > 0) {
            transicaoModelo();
        }

        o.resetAnimacao();
    });

    $('#load-modal').data('loadAudio')('sounds/usuario-detectado.mp3', function (audio) {
        usuarioDetectadoAudio = audio;

        usuarioDetectadoAudio.onplay = function () {
            this.ended = false;
        };

        usuarioDetectadoAudio.onended = function () {
            audioTransicao = null;
            this.ended = true;
        };
    });

    $('#load-modal').data('loadAudio')('sounds/pao-de-acucar-curvas-de-nivel.mp3', function (audio) {

        $('#load-modal').data('loadOBJMTL')('paoDeAcucarCamadas', 'lib/on-daed-js/models/pao_de_acucar-final.obj', 'lib/on-daed-js/models/pao_de_acucar-final.mtl', function (object) {

            object.scale.multiplyScalar(36);

            object.scale.y *= 1.75;

            var wrap = new THREE.Object3D();

            object.traverse(function (o) {
                if (o.material instanceof THREE.MeshPhongMaterial || o.material instanceof THREE.MeshLambertMaterial) {
                    o.material = new THREE.MeshBasicMaterial({
                        color: parseInt(0xFFFFFF - 0x888888 * Math.random())
                    });
                }
            });

            wrap.add(object);

            obj.push({
                o: wrap,
                t: "PÃO DE AÇÚCAR - CURVAS DE NÍVEL",
                s: 1,
                a: audio,
                idle: function () {
                    var obj = this.o;
                    obj.rotation.y += incrementoAnimacao;
//                obj.rotation.z += incrementoAnimacao;
                    obj.rotation.x += incrementoAnimacao;
                },
                pos: new THREE.Vector3(0, 60, 0),
                rot: new THREE.Euler(0, 0, 0),
                scale: wrap.scale.clone()
            });

        });

    });

    // LOGO ON NOVO
    $('#load-modal').data('loadAudio')('sounds/logomarca-observatorio-nacional.mp3', function (audio) {

        $('#load-modal').data('loadOBJMTL')('logo_ON', 'lib/on-daed-js/models/logo_ON.obj', 'lib/on-daed-js/models/logo_ON.mtl', function (object) {

//        var material = new THREE.MeshLambertMaterial({
//            color: 0x0000FF
//        });

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.emissive = child.material.color;
                }
            });

            object.scale.multiplyScalar(120);

            object.rotation.set(Math.PI / 2, 0, Math.PI / 2);

            var wrap = new THREE.Object3D();

            wrap.add(object);

            obj.push({
                o: wrap,
                t: "LOGOMARCA OBSERVATÓRIO NACIONAL",
                s: 1,
                a: audio,
                idle: function () {
                    var obj = this.o;
                    obj.rotation.y += incrementoAnimacao;
                    obj.rotation.z += incrementoAnimacao;
                    obj.rotation.x += incrementoAnimacao;
                },
                pos: new THREE.Vector3(0, 60, 0),
                rot: new THREE.Euler(0, 0, 0),
                scale: wrap.scale.clone()
            });
        });

    });

    // LOGO ON ANTIGO FINAL
    $('#load-modal').data('loadAudio')('sounds/emblema-do-observatorio-nacional.mp3', function (audio) {

        $('#load-modal').data('loadOBJMTL')('logo_ON_antigo', 'lib/on-daed-js/models/logo_antigo-final.obj', 'lib/on-daed-js/models/logo_antigo-final.mtl', function (object) {

            var objIdx = 0;

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {

                    if (!(objIdx === 2 || objIdx === 3)) {

                        child.material = new THREE.MeshBasicMaterial({
                            color: 0xFFFF00
                        });

                    } else {

                        var faces = [];

                        function resolvercor() {
                            var fact = Math.random();
//                        return new THREE.Color(fact > 1 / 3 ? 0x00FF00 : (fact > 0.5 / 3 ? 0xFFFF00 : 0x0000FF));
                            return new THREE.Color(fact < 1 / 3 ? 0x000000 : 0x00FF00);
                        }

                        for (var i = 0; i < child.geometry.faces.length; i++) {

                            var a = child.geometry.faces[i].a;
                            var b = child.geometry.faces[i].b;
                            var c = child.geometry.faces[i].c;

                            if (!faces[a]) {
                                faces[a] = resolvercor();
                            }

                            if (!faces[b]) {
                                faces[b] = resolvercor();
                            }

                            if (!faces[c]) {
                                faces[c] = resolvercor();
                            }

                            child.geometry.faces[i].vertexColors[0] = faces[a];
                            child.geometry.faces[i].vertexColors[1] = faces[b];
                            child.geometry.faces[i].vertexColors[2] = faces[c];
                        }

                        child.material = new THREE.MeshBasicMaterial({
                            vertexColors: THREE.VertexColors
                        });

                    }

                    objIdx++;
                }
            });

            object.scale.multiplyScalar(14);

            object.rotation.set(-Math.PI / 2, 0, -Math.PI / 2);

            var wrap = new THREE.Object3D();

            wrap.add(object);

            obj.push({
                o: wrap,
                t: "EMBLEMA DO OBSERVATÓRIO NACIONAL",
                s: 1,
                a: audio,
                idle: function () {
                    var obj = this.o;
                    obj.rotation.y += incrementoAnimacao;
                    obj.rotation.z += incrementoAnimacao;
                    obj.rotation.x += incrementoAnimacao;
                },
                pos: new THREE.Vector3(0, 60, 0),
                rot: new THREE.Euler(0, 0, 0),
                scale: wrap.scale.clone()
            });
        });
    });
//
    // VOYAGER 1
    $('#load-modal').data('loadAudio')('sounds/voyager-1.mp3', function (audio) {

        $('#load-modal').data('loadOBJMTL')('voyager', 'lib/on-daed-js/models/voyager/Voyager_17.obj', 'lib/on-daed-js/models/voyager/Voyager_17.mtl', function (object) {

//        var material = new THREE.MeshLambertMaterial({
//            color: 0x0000FF
//        });

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    child.material.emissive.setRGB(1, 1, 1);
                }
            });

            object.scale.multiplyScalar(12);

            object.rotation.set(0, 0, Math.PI / 4);

            var wrap = new THREE.Object3D();

            wrap.add(object);

            obj.push({
                o: wrap,
                t: "SONDA ESPACIAL VOYAGER 1",
                s: 1.4,
                a: audio,
                idle: function () {
                    var obj = this.o;
                    obj.rotation.y += incrementoAnimacao;
                    obj.rotation.z += incrementoAnimacao / 3;
                },
                pos: new THREE.Vector3(0, 60, 0),
                rot: new THREE.Euler(0, 0, 0),
                scale: wrap.scale.clone()
            });
        });
    });

    $('#load-modal').data('loadAudio')('sounds/magnetosfera.mp3', function (audio) {

        // Linhas de Forca
        var linhasDeForca = ON_DAED['3D'].LinhasDeForcaTerra(posObject);
        var objetoLinhas = linhasDeForca.getWrapperLinhas();

        objetoLinhas.rotation.z = Math.PI / 2;
        objetoLinhas.scale.multiplyScalar(3);

        var wrapLinhasDeForca = new THREE.Object3D();
        wrapLinhasDeForca.add(objetoLinhas);

        wrapLinhasDeForca.visible = false;

        obj.push({
            o: wrapLinhasDeForca,
            t: "LINHAS DE FORÇA - MAGNETOSFERA",
            s: 1.2,
            a: audio,
            idle: function () {
                var obj = this.o;
                obj.rotation.y += incrementoAnimacao;
            },
            pos: new THREE.Vector3(0, 60, 0),
            rot: new THREE.Euler(0, 0, 0),
            instancia: linhasDeForca,
            scale: wrapLinhasDeForca.scale.clone()
        });
    });

    // planetas

    function loadPlaneta(nome, texturePath, audioPath, callback) {

        (function () {

            var path = audioPath;

            $('#load-modal').data('loadAudio')(path, function (audio) {

                var planeta = new THREE.Mesh(new THREE.SphereGeometry(40, 32, 16), new THREE.MeshBasicMaterial({
                    map: THREE.ImageUtils.loadTexture(texturePath)
                }));

                var wrapPlaneta = new THREE.Object3D();
                wrapPlaneta.add(planeta);

                var criado = {
                    o: wrapPlaneta,
                    t: nome,
                    a: audio,
                    s: 1.4,
                    idle: function () {
                        var obj = this.o;
                        obj.rotation.y += incrementoAnimacao;
                    },
                    pos: new THREE.Vector3(0, 60, 0),
                    rot: new THREE.Euler(0, 0, 0),
                    scale: planeta.scale.clone()
                };

                obj.push(criado);

                if (callback instanceof Function) {
                    callback(planeta, criado);
                }

            });

        })();
    }

    loadPlaneta("CARTA MAGNÉTICA - INTENSIDADE", "lib/on-daed-js/imgs/texturas/terra/carta-magnetica-intensidade.png", "sounds/carta-magnetica-intensidade.mp3", function (planeta, obj) {
        obj.s = 0.9;
    });

    loadPlaneta("CARTA MAGNÉTICA - DECLINAÇÃO", "lib/on-daed-js/imgs/texturas/terra/carta-magnetica-declinacao.png", "sounds/carta-magnetica-declinacao.mp3", function (planeta, obj) {
        obj.s = 0.9;
    });

    loadPlaneta("CARTA MAGNÉTICA - INCLINAÇÃO", "lib/on-daed-js/imgs/texturas/terra/carta-magnetica-inclinacao.png", "sounds/carta-magnetica-inclinacao.mp3", function (planeta, obj) {
        obj.s = 0.9;
    });

    loadPlaneta("CARTA MAGNÉTICA - VARIAÇÃO SECULAR DE INTENSIDADE", "lib/on-daed-js/imgs/texturas/terra/carta-magnetica-variacao-intensidade.png", "sounds/carta-magnetica-variacao-intensidade.mp3", function (planeta, obj) {
        obj.s = 0.75;
    });

    loadPlaneta("CARTA MAGNÉTICA - VARIAÇÃO SECULAR DE DECLINAÇÃO", "lib/on-daed-js/imgs/texturas/terra/carta-magnetica-variacao-declinacao.png", "sounds/carta-magnetica-variacao-declinacao.mp3", function (planeta, obj) {
        obj.s = 0.75;
    });

    loadPlaneta("CARTA MAGNÉTICA - VARIAÇÃO SECULAR DE INCLINAÇÃO", "lib/on-daed-js/imgs/texturas/terra/carta-magnetica-variacao-inclinacao.png", "sounds/carta-magnetica-variacao-inclinacao.mp3", function (planeta, obj) {
        obj.s = 0.75;
    });

    loadPlaneta("PLANETA MERCÚRIO", "lib/on-daed-js/imgs/texturas/planetas/mercury.jpg", "sounds/mercurio.mp3");

    loadPlaneta("PLANETA VÊNUS", "lib/on-daed-js/imgs/texturas/planetas/venus-cloud.jpg", "sounds/venus.mp3");

    loadPlaneta("PLANETA TERRA", "lib/on-daed-js/imgs/texturas/terra/map.jpg", "sounds/terra.mp3");

    loadPlaneta("PLANETA MARTE", "lib/on-daed-js/imgs/texturas/planetas/mars.jpg", "sounds/marte.mp3");

    loadPlaneta("PLANETA JÚPITER", "lib/on-daed-js/imgs/texturas/planetas/jupiter.jpg", "sounds/jupiter.mp3");

    loadPlaneta("PLANETA SATURNO", "lib/on-daed-js/imgs/texturas/planetas/saturn.jpg", "sounds/saturno.mp3", function (saturn) {
        var rings = new THREE.Mesh(new THREE.PlaneBufferGeometry(160, 160), new THREE.MeshBasicMaterial({
            side: THREE.DoubleSide,
            transparent: true,
            map: THREE.ImageUtils.loadTexture("lib/on-daed-js/imgs/texturas/planetas/saturn-rings.png")
        }));

        rings.rotation.x = Math.PI / 2;

        saturn.rotation.x = Math.PI / 4;

        saturn.add(rings);

        saturn.scale.multiplyScalar(0.6);
    });

    loadPlaneta("PLANETA URANO", "lib/on-daed-js/imgs/texturas/planetas/uranus.jpg", "sounds/urano.mp3");

    loadPlaneta("PLANETA NETUNO", "lib/on-daed-js/imgs/texturas/planetas/neptune.jpg", "sounds/netuno.mp3");

    loadPlaneta("SATÉLITE LUA", "lib/on-daed-js/imgs/texturas/lua/lua-new.jpg", "sounds/lua.mp3");

    // fim planetas

    if (data) {

        $('#load-modal').data('loadAudio')("sounds/cosmologia-2015.mp3", function (audio) {

            // Grafico Globo
            var raioPlaneta = 30;
            var graficoGlobo = ON_DAED["3D"].GraficoGlobo(posObject, null, raioPlaneta);

            for (var i in data) {
                graficoGlobo.cadData(data[i]);
            }

            var objGraficoGlobo = graficoGlobo.getObjetoTerra();
            objGraficoGlobo.visible = false;

            obj.push({
                o: objGraficoGlobo,
                t: "ALUNOS DO CURSO - COSMOLOGIA 2015",
                a: audio,
                idle: function () {
                    var obj = this.o;
                    obj.rotation.y += incrementoAnimacao;
                },
                s: 1,
                pos: new THREE.Vector3(0, 60, 0),
                rot: new THREE.Euler(),
                instancia: graficoGlobo,
                scale: objGraficoGlobo.scale.clone()
            });

        });
    }


    $('#load-modal').data('loadAudio')("sounds/sol.mp3", function (audio) {

        ON_DAED["3D"].ativarFlaresSol(function () {

            // Sol
            var objetoSol = new THREE.Object3D();
            var sol = ON_DAED['3D'].criarSol(objetoSol);

            objetoSol.scale.multiplyScalar(0.45);

            obj.push({
                o: objetoSol,
                a: audio,
                t: "ESTRELA SOL",
                s: 1.4,
                idle: function () {
                    var obj = this.o;
                    obj.rotation.y += incrementoAnimacao;
                },
                pos: new THREE.Vector3(0, 60, 0),
                rot: new THREE.Euler(0, 0, 0),
                scale: objetoSol.scale.clone()
            });
        });
    });

    // nuvem molecular
    $('#load-modal').data('loadAudio')("sounds/formacao-estelar.mp3", function (audio) {

        var nuvemMolecular = ON_DAED['3D'].NuvemMolecular(scene);

        obj.push({
            o: nuvemMolecular,
            t: "FORMAÇÃO ESTELAR",
            s: 1.4,
            a: audio,
            idle: function () {
                var obj = this.o;
                obj.rotation.y += incrementoAnimacao;
            },
            pos: new THREE.Vector3(0, 60, 0),
            rot: new THREE.Euler(0, 0, 0),
            scale: nuvemMolecular.scale.clone()
        });

    });

    // PLACAS LITOSFÉRICAS
    $('#load-modal').data('loadAudio')("sounds/litosfericas.mp3", function (audio) {
        var placasLitosfericas = ON_DAED['3D'].PlacasLitosfericas(scene);

        obj.push({
            a: audio,
            o: placasLitosfericas,
            t: "PLACAS LITOSFÉRICAS",
            s: 1.4,
            idle: function () {
                var obj = this.o;
                obj.rotation.y += incrementoAnimacao;
            },
            pos: new THREE.Vector3(0, 60, 0),
            rot: new THREE.Euler(0, 0, 0),
            scale: placasLitosfericas.scale.clone()
        });
    });


// Meteoro
    $('#load-modal').data('loadAudio')("sounds/cometa67p.mp3", function (audio) {
        $('#load-modal').data('loadOBJMTL')('voyager', 'lib/on-daed-js/models/meteoro/meteoro.obj', 'lib/on-daed-js/models/meteoro/meteoro.mtl', function (object) {

            object.scale.multiplyScalar(0.85);

            object.rotation.set(0, 0, Math.PI / 4);

            object.traverse(function (child) {
                if (child instanceof THREE.Mesh) {
                    var map = child.material.map;
                    child.material = new THREE.MeshBasicMaterial();
                    child.material.map = map;
                }
            });

            var wrap = new THREE.Object3D();
            wrap.add(object);

            obj.push({
                o: wrap,
                t: "COMETA 67P",
                a: audio,
                s: 1.4,
                idle: function () {
                    var obj = this.o;
                    obj.rotation.y += incrementoAnimacao;
                    obj.rotation.z += incrementoAnimacao / 3;
                },
                pos: new THREE.Vector3(0, 60, 0),
                rot: new THREE.Euler(0, 0, 0),
                scale: wrap.scale.clone()
            });
        });
    });

    var o = {};

    function showLabelUsuario() {

        if (obj[current].a) {
            if (verificarAudioPronto(obj[current].a)) {
                audioTransicao = obj[current].a;
            } else {
                console.log("Estado do audio inválido: ", obj[current].a.readyState);
            }
        }

        if (audioTransicao) {
            if (verificarAudioPronto(audioTransicao)) {
                audioTransicao.currentTime = 0;
                audioTransicao.play();
            } else {
                console.log("Estado do audio inválido: ", audioTransicao.readyState);
            }
        }

        $('#label-model').show();
        fadeOutTimer = setTimeout(function () {
            $('#label-model').hide();
        }, 3750);
    }

    function transicaoModelo(back) {

        reiniciarAudios();
        clearTimeout(fadeOutTimer);
        $('#label-model').hide();

        obj[current].o.visible = false;
        if (back === undefined) {
            current = (current + 1) % obj.length;
        } else {
            current = current - 1 < 0 ? obj.length - 1 : current - 1;
        }

        obj[current].o.visible = true;
        if (obj[current].t instanceof Function) {
            obj[current].t();
        } else {
            $('#label-model').html(obj[current].t);
            $('#label-model').css({'font-size': (obj[current].s * 0.9) + "em"});
        }

        if (usuarioDetectado) {
            showLabelUsuario();
        }
    }

    o.verModelo = function (idx) {
        if (obj[idx]) {
            obj[current].o.visible = false;
            current = idx;
            obj[current].o.visible = true;
        }
    };

    o.update = function () {

        if (!usuarioDetectado) {

            timestamp = new Date().getTime();

            if (timestamp - ultTimestamp >= delayTransicao) {
                ultTimestamp = timestamp;
                transicaoModelo();
            }

            rotY.rotation.set(0, 0, 0);
            rotX.rotation.set(0, 0, 0);

            if (rotated) {
                posObject.position.copy(obj[current].pos);
            } else {
                posObject.position.copy(obj[current].pos.clone().multiplyScalar(1 / 4));
            }

            userLeftHandSpeed.set(0, 0, 0);

            obj[current].idle();

        } else {

            o.resetAnimacao();

            rotX.rotation.y += userLeftHandSpeed.x;

            if (rotated) {
                rotY.rotation.z += userLeftHandSpeed.y;
            } else {
                rotY.rotation.x += userLeftHandSpeed.y;
            }

            //obj[current].o.rotation.y = Math.atan2(x, y);

            //obj[current].o.scale.multiplyScalar(scale);

            userLeftHandSpeed.x += -Math.sign(userLeftHandSpeed.x) * rotationInteractionSpeed;
            userLeftHandSpeed.y += -Math.sign(userLeftHandSpeed.y) * rotationInteractionSpeed;

            if (userLeftHandSpeed.x < rotationInteractionSpeed * 1.5 && userLeftHandSpeed.x > -rotationInteractionSpeed * 1.5) {
                userLeftHandSpeed.x = 0;
            }

            if (userLeftHandSpeed.y < rotationInteractionSpeed * 1.5 && userLeftHandSpeed.y > -rotationInteractionSpeed * 1.5) {
                userLeftHandSpeed.y = 0;
            }

        }

    };

    o.getUltimoDataUsuario = function () {
        return ultDataUsuario;
    };

    o.setUltimoDataUsuario = function (data) {
        ultDataUsuario = data;
        if (ultDataUsuario.t - dataUsuarioDelay.t >= delayGesto) {
            var distanciaRightHandX = 0.2;
            var difXRightHand = dataUsuarioDelay.rightHand[0] - ultDataUsuario.rightHand[0];
            if (difXRightHand >= distanciaRightHandX) {
                transicaoModelo();
            } else if (difXRightHand <= -distanciaRightHandX) {
                transicaoModelo(true);
            }

            var stopX = Math.abs(ultDataUsuario.rightHand[2] - ultDataUsuario.head[2]);
            var stopY = Math.abs(ultDataUsuario.leftHand[2] - ultDataUsuario.head[2]);

            if (stopY > blockSpeedDistance) {
                var difXLeftHand = dataUsuarioDelay.leftHand[0] - ultDataUsuario.leftHand[0];
                var difYLeftHand = dataUsuarioDelay.leftHand[1] - ultDataUsuario.leftHand[1];
                userLeftHandSpeed.x -= difXLeftHand * 1.75;
                userLeftHandSpeed.y += difYLeftHand * 1.75;
            }

            if (stopY > blockSpeedDistance && stopX > blockSpeedDistance) {
                userLeftHandSpeed.x = 0;
                userLeftHandSpeed.y = 0;
            }

            dataUsuarioDelay = ultDataUsuario;
        }
    };

    o.resetAnimacao = function () {
        for (var i = 0; i < obj.length; i++) {
            var object = obj[i].o;

            var rY = 0;

            if (!rotated) {
                rY = cantosRotation[labelCantosIdx] * Math.PI / 180;
            }

            object.rotation.set(0, rY, 0);
            object.position.set(0, 0, 0);
            object.scale.copy(obj[i].scale);
        }

    };

    o.transicaoModelo = transicaoModelo;

    o.getY = function () {
        return YDifference;
    };

    o.resetY = function () {
        group.position.y = 0;
    };

    o.setUsuarioDetectado = function (ud) {
        var mudou = !usuarioDetectado && ud;
        usuarioDetectado = ud;
        if (mudou) {
            showLabelUsuario();
        } else if (!usuarioDetectado) {
            if (audioTransicao !== null) {
                audioTransicao.currentTime = 0;
                audioTransicao.pause();
                audioTransicao = null;
            }
        }
    };

    o.getUsuarioDetectado = function () {
        return usuarioDetectado;
    };

    o.getObjects = function () {
        return obj;
    };

    return o;
};