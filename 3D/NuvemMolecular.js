ON_DAED["3D"].NuvemMolecular = function (scene) {
    var o = new THREE.Object3D();

    var particulas = [];

    var numParticulas = 1000;
    var countVisible = numParticulas;

    var escalaSol = 0.225;
    var tamanhoSol = 90;

    var estrela = new THREE.Object3D();
    var sol = ON_DAED['3D'].criarSol(estrela);

    sol.scale.multiplyScalar(escalaSol);

    estrela.visible = false;
    
    o.add(estrela);
    
    var esferaBranca = new THREE.Mesh(new THREE.SphereGeometry(escalaSol * tamanhoSol, 64, 32), new THREE.MeshBasicMaterial({
        color: 0xFFFFFF
    }));

    esferaBranca.scale.z = esferaBranca.scale.y = esferaBranca.scale.x = 1 / numParticulas;

    o.add(esferaBranca);

    function initParticula(p) {
        var hAngle = Math.random() * Math.PI * 2;
        var vAngle = Math.random() * Math.PI * 2;
        var r = 5 + 55 * Math.random();

        p.it = 0;
        p.r = r;
        p.hAngle = hAngle;
        p.vAngle = vAngle;

        p.position.copy(MathHelper.sphericalToCartesian(r, hAngle, vAngle));

        var scale = Math.random() * 2.5;

        p.scale.set(scale, scale, 1);

        p.material.color.setHex(0x999999 + 0x111111 * parseInt(6 * Math.random()));

        p.ciclo = true;

    }

    function start() {
        estrela.visible = false;
        esferaBranca.visible = true;
        estrela.scale.z = estrela.scale.y = estrela.scale.x = esferaBranca.scale.z = esferaBranca.scale.y = esferaBranca.scale.x = 1 / particulas.length;
        countVisible = particulas.length;
        for (var i = 0; i < particulas.length; i++) {
            initParticula(particulas[i]);
        }
    }

    var velocidadeUniao = 80;

    for (var i = 0; i < numParticulas; i++) {

        var material = new THREE.SpriteMaterial({
            map: THREE.ImageUtils.loadTexture("lib/on-daed-js/imgs/texturas/nuvem-molecular/particula.png")
        });

        var p = new THREE.Sprite(material);

        particulas.push(p);
        initParticula(p);

        var semOperacao = 0;
        var maxSemOperacao = 38000;

        ON_DAED['3D'].register(o, p, function () {

            if (o.visible) {

                if (this.ciclo) {
                    this.it++;
                    var r = this.r - this.r * (this.it / velocidadeUniao);

                    this.position.copy(MathHelper.sphericalToCartesian(r, this.hAngle, this.vAngle));

                    if (r <= 5) {
                        this.material.color.setHex(0xFFFFFF);
                        this.ciclo = false;
                        countVisible--;
                        
                        var esfera;
                        
                        if(countVisible > (numParticulas / 2)) {
                            esfera = esferaBranca;
                            estrela.visible = false;
                            esferaBranca.visible = true;
                        } else {
                            esfera = estrela;
                            estrela.visible = true;
                            esferaBranca.visible = false;
                        }
                        
                        esfera.scale.z = esfera.scale.y = esfera.scale.x = ((particulas.length - countVisible) / particulas.length);
                    }

                } else if (countVisible === 0 && semOperacao++ === maxSemOperacao) {
                    semOperacao = 0;
                    start();
                }

            }

        });
    }

    scene.add(o);

    return o;
};