
var tiempo;
var eliminar;
var nuevoDulce;
var intervalo;
var color=0;
var colores = ['white', 'yellow'];
var estado=0;
var puntos = 0,
        movimientos = 0,
        tiempoJuego = 120, // segundos
        tiempoEliminar,
        tiempoNuevo,
        tiempoIntervalo,
        tiempoRestante,
        tiempo,
figValidas = 0;

var divMovimiento = null;
var divArrastre = null;

var numCopias = filas*columnas/3;


var seleccion1 = null;
var seleccion2 = null;
var dulce = ['image/n1.png', 'image/n2.png', 'image/n3.png', 'image/n4.png'];

var numImagenes=dulce.length;


//var filas = 6;
//var columnas = 7;
var filas = 6;
var columnas = 7;
//var renovar = false;

var cuadro = [filas];





$(function(){

  function Dulces(posx, posy, obj, src){
    return{
      columna: posx,
      fila: posy,
      fuente: src,
      enCombo: false,
      o: obj
    };
  }


  function mezclar(){
    var n = Math.floor((Math.random()*numImagenes));
    return dulce[n];
  }

  var cambiarColorTitulo = function(){
    setInterval(function(){
      if(color===colores.length){
        color = 0;
      }
        $('.main-titulo').css('color',colores[color]);
        color++;;
      },1000);
  };

  $(".btn-reinicio").click(function(){
    $(this).html("Reinciar");
    if (estado === 0) {
        estado = 1;
        iniciarTiempo();
        activarDragDrop();
        seleccionaryEliminar();
    } else {
        reiniciar();
    }
  });

  function reiniciar() {
      figValidas = 0;
      puntos = 0;
      movimientos = 0;
      tiempoRestante = tiempoJuego;
      actualizarTiempo();
      actualizarMovimientos();
      actualizarPuntos();
      clearTimeout(tiempo);
      clearTimeout(tiempoEliminar)
      var divTiempo = $('.time').css("display");
      if (divTiempo ==='none'){
          $('.panel-tablero').slideToggle("slow", function () {
              iniciarTiempo();
          });
          $('.time').show();
          $('.finalizacion').hide();
          $('.panel-score').css({'width': '25%'});
          $('.panel-score').resize({
              animate: true
          });
      }else{
          iniciarTiempo();
      }
      crearTablero();
      seleccionaryEliminar();
      actualizarPuntos();
  }


  function iniciarTiempo() {
      tiempoRestante = tiempoJuego;
      tiempo = setTimeout(countDown, 1000);
      tiempoEliminar = setTimeout(eliminarenMemoria,1000);
      //tiempoNuevo = setTimeout(crearDulce,1000);

  }

  function countDown(){
    tiempoRestante -= 1;

    actualizarTiempo();
    if (tiempoRestante === 0) {
        return finalizacion();
    }
    tiempo = setTimeout(countDown, 1000);
  }

  function actualizarTiempo() {
      $('#timer').html(formatoTiempo(tiempoRestante));
  }

  function actualizarPuntos() {
      $('#score-text').html(puntos);
  }

  function actualizarMovimientos() {
      $('#movimientos-text').html(movimientos);
  }

  function finalizacion() {
      $('.panel-tablero').slideToggle("slow", function () {
          $('.time').hide();
          $('.finalizacion').show();
          $('.panel-score').css({'width': '100%'});
          $('.panel-score').resize({
              animate: true
          });
      });
  }

  function crearTablero(){
    for(var f = 0; f< filas; f++){
      cuadro[f]=[];
      for(var c = 0; c<columnas; c++){

        cuadro[f][c] = new Dulces(f,c,null, mezclar());
        //console.log(cuadro[f][c]);
        var celda = $('#'+f+'_'+c).html("<img src='" + cuadro[f][c].fuente + "' alt='" + f + "," + c + "'/>");

        cuadro[f][c].o = celda;
      }
    }
  }

  function activarDragDrop(){
    for (var f = 0; f < filas; f++) {
         for (var c = 0; c < columnas; c++) {
             var celda = $('#' + f + '_' + c);
              celda.draggable(
                    {
                        containment: '.panel-tablero',
                        cursor: 'move',
                        zIndex: 100,
                        opacity: 0.85,
                        snap: '.panel-tablero',
                        stack: '.panel-tablero',
                        revert: true,
                        start: handleDragStart,
                        stop: handleDragStop
                    });
            celda.droppable(
                    {
                        drop: handleDropEvent
                    });
         }
    }
  }
//----

  function handleDragStop(event, ui){
    var src = divMovimiento.split("_");
    var sf = src[0];
    var sc = src[1];

    var dst = divArrastre.split("_");
    var df = dst[0];
    var dc = dst[1];

    var ddx = Math.abs(parseInt(sf) - parseInt(df));
    var ddy = Math.abs(parseInt(sc) - parseInt(dc));

    if (ddx > 1 || ddy > 1)
    {
        return;
    }

    if (sf !== df && sc !== dc) {
        return;
    }

    var tmp = cuadro[sf][sc].fuente;
    cuadro[sf][sc].fuente = cuadro[df][dc].fuente;
    cuadro[sf][sc].o.html("<img src='" + cuadro[sf][sc].fuente + "' alt='" + sf + "," + sc + "'/>")
    cuadro[df][dc].fuente = tmp;
    cuadro[df][dc].o.html("<img src='" + tmp + "' alt='" + df + "," + dc + "'/>");

    movimientos +=1;
    divMovimiento = null;
    divArrastre =null;
    actualizarMovimientos();
    figValidas=0;
    seleccionaryEliminar();

  }

  function handleDragStart(event, ui){
    divMovimiento = event.target.id;
  }

  function handleDropEvent(event, ui){
    divArrastre = event.target.id;
  }

  function seleccionaryEliminar(){
    for (var f = 0; f < filas; f++) {
        var prevCelda = null;
        var figLongitud = 0;
        var figInicio = null;
        var figFin = null;

        for (var c = 0; c < columnas; c++) {

            // Primer celda para el combo
            if (prevCelda === null)
            {
                prevCelda = cuadro[f][c].fuente;
                figInicio = c;
                figLongitud = 1;
                figFin = null;
                continue;
            } else {
                var curCelda = cuadro[f][c].fuente;
                if (!(prevCelda === curCelda)) {
                    if (figLongitud >= 3)
                    {
                        figValidas += 1;
                        figFin = c - 1;

                        for (var ci = figInicio; ci <= figFin; ci++)
                        {
                            cuadro[f][ci].enCombo = true;
                            cuadro[f][ci].fuente = null;
                        }
                        puntos += 10*figLongitud;
                        puntos += figValidas;
                    }
                    prevCelda = cuadro[f][c].fuente;
                    figInicio = c;
                    figFin = null;
                    figLongitud = 1;
                    continue;
                } else {
                    figLongitud += 1;
                    if (c === (columnas - 1)) {
                        if (figLongitud >= 3)
                        {
                            figValidas += 1;
                            figFin = c;
                            for (var ci = figInicio; ci <= figFin; ci++)
                            {
                                cuadro[f][ci].enCombo = true;
                                cuadro[f][ci].fuente = null;
                            }
                            puntos += 10*figLongitud;
                            puntos += figValidas;
                            prevCelda = null;
                            figInicio = null;
                            figFin = null;
                            figLongitud = 1;
                            continue;
                        }
                    } else {
                        prevCelda = cuadro[f][c].fuente;
                        figFin = null;
                        continue;
                    }
                }
            }
        }
    }

    for (var c = 0; c < columnas; c++)
    {
        var prevCelda = null;
        var figLongitud = 0;
        var figInicio = null;
        var figFin = null;

        for (var f = 0; f < filas; f++)
        {
            if (cuadro[f][c].enCombo)
            {
                figInicio = null;
                figFin = null;
                prevCelda = null;
                figLongitud = 1;
                continue;
            }
            if (prevCelda === null)
            {
                prevCelda = cuadro[f][c].fuente;
                figInicio = f;
                figLongitud = 1;
                figFin = null;
                continue;
            } else
            {
                var curCell = cuadro[f][c].fuente;
                if (!(prevCelda === curCell))
                {
                    if (figLongitud >= 3)
                    {
                        figValidas += 1;
                        figFin = f - 1;
                        for (var ci = figInicio; ci <= figFin; ci++)
                        {
                            cuadro[ci][c].enCombo = true;
                            cuadro[ci][c].fuente = null;
                        }
                        puntos += 10*figLongitud;
                        puntos += figValidas;
                    }
                    prevCelda = cuadro[f][c].fuente;
                    figInicio = f;
                    figFin = null;
                    figLongitud = 1;
                    continue;
                } else
                {
                    figLongitud += 1;
                    if (f === (filas - 1)) {
                        if (figLongitud >= 3)
                        {
                            figValidas += 1;
                            figFin = f;
                            for (var ci = figInicio; ci <= figFin; ci++)
                            {
                                cuadro[ci][c].enCombo = true;
                                cuadro[ci][c].fuente = null;
                            }
                            puntos += 10*figLongitud;
                            puntos += figValidas;
                            prevCelda = null;
                            figInicio = null;
                            figFin = null;
                            figLongitud = 1;
                            continue;
                        }
                    } else {
                        prevCelda = cuadro[f][c].fuente;
                        figFin = null;
                        continue;
                    }
                }
            }
        }
    }

    var esCombo = false;
    for(var f = 0; f<filas; f++){
      for(var  c= 0; c<columnas;c++){
        if(cuadro[f][c].enCombo){
          esCombo=true;
        }
      }
    }

    if(esCombo){
      eliminarImagenes();
    }
    mostrarImagenes();
  }

  function eliminarImagenes(){
    for (var f = 0; f < filas; f++){
        for (var c = 0; c < columnas; c++){
            if (cuadro[f][c].enCombo)  // Celda vacia
            {
                //efecto blink al eliminar
                cuadro[f][c].o.animate({
                    opacity: 0
                }, 250);
                cuadro[f][c].o.animate({
                    opacity: 1
                }, 250);
                cuadro[f][c].o.animate({
                    opacity: 0
                }, 250);

            }
        }
    }

    actualizarPuntos();

    $(":animated").promise().done(function () {
        eliminarenMemoria();
     });
  }

  function crearNuevos(){

  }

  function eliminarenMemoria(){

    for(var f=0; f < filas; f++){
      for(var c=0; c < columnas; c++){
        if(cuadro[f][c].enCombo){
          cuadro[f][c].o.html("");
          cuadro[f][c].enCombo=false;
          //TODO:cambiar a animacion de gravedad AQUI
          for(var sr = f; sr>=0; sr--){
            if(sr==0){
              break; //es primera fila
            }

            var tmp = cuadro[sr][c].fuente;
            cuadro[sr][c].fuente = cuadro[sr -1][c].fuente;
            //cuadro[sr][c].o.o.animate({ top: '-=30'}, 10);
            //cuadro[sr][c].o.animate({ top: '+=30'}, 500);
            cuadro[sr-1][c].fuente=tmp;


          }
        }
      }
    }

    //fin de movimiento y animacion

    //dibujar crearTablero
    //setTimeout volver a crear dulces
    for (var f = 0; f < filas; f++)
    {
        for (var c = 0; c < columnas; c++)
        {
            cuadro[f][c].o.html("<img src='" + cuadro[f][c].fuente + "' alt='" + f + "," + c + "'/>");
            cuadro[f][c].o.css("opacity", 1);
            cuadro[f][c].enCombo = false;
            //TODO: animar caida gravedad de cuadros nuevos AQUI
            if ( cuadro[f][c].fuente === null){
              cuadro[f][c].respawn = true;
            }


            if (cuadro[f][c].respawn === true)
            {


                cuadro[f][c].o.off("handleDragStart");
                cuadro[f][c].o.off("handleDropEvent");
                cuadro[f][c].o.off("handleDragStop");

                cuadro[f][c].respawn = false;

                cuadro[f][c].fuente = mezclar();

                cuadro[f][c].o.html("<img src='" + cuadro[f][c].fuente + "' alt='" + f + "," + c + "'/>");


                //simular caida gravedad
                // cuadro[f][c].o.animate({ top: '-=30'}, 10);
                // cuadro[f][c].o.animate({ top: '+=30'}, 500);

                cuadro[f][c].o.draggable(
                        {
                            containment: '.panel-tablero',
                            cursor: 'move',
                            zIndex: 100,
                            opacity: 0.85,
                            snap: '.panel-tablero',
                            stack: '.panel-tablero',
                            revert: true,
                            start: handleDragStart,
                            stop: handleDragStop
                        });
                cuadro[f][c].o.droppable(
                        {
                            drop: handleDropEvent
                        });
            }else{
                 cuadro[f][c].o.css("opacity", 1);
            }

        }
    }


    mostrarImagenes();
    seleccionaryEliminar();
    mostrarImagenes();

  }

  function mostrarImagenes(){
    for (var f = 0; f < filas; f++){
          for (var c = 0; c < columnas; c++){
              if (cuadro[f][c].o.css("opacity")===0){
                cuadro[f][c].o.css("opacity", 1);
              }
          }
      }
  }

//esta variable maneja a Tiempo. Sale con el formato adecuado.

  var temporizador = function () {
      var $timer,
              tiempo = 1000;
      incrementador = 70,
              actualizarTiempo = function () {
                  $timer.html(formatTime(tiempo));
                  if (tiempo === 0) {
                      temporizador.Timer.stop();
                      return;
                  }
                  tiempo -= incrementador / 10;
                  if (tiempo < 0) {
                      tiempo = 0;
                      tiempoCompleto();
                  }

              },
              tiempoCompleto = function () {
                  alert('Tiempo completado');
              },
              init = function () {
                  $timer = $('#timer');
                  temporizador.Timer = $.timer(actualizarTiempo, incrementador, true);
              };
      this.restaurarTiempo = function () {
          temporizador.Timer = $.timer();
      };
      $(init);

  };



  $(function () {
      cambiarColorTitulo();
      //añadir funcion iniciar aqui
      crearTablero();
      //console.log("inicio");
  });

// Funciones comunes.
  function pad(number, length) {
      var str = '' + number;
      while (str.length < length) {
          str = '0' + str;
      }
      return str;
  }

  function formatoTiempo(time) {
      var min = parseInt(time / 60),
              sec = time - (min * 60);

      return (min > 0 ? pad(min, 2) : "00") + ":" + pad(sec, 2);
  }




}());
