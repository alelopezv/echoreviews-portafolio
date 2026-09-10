// El motivo de rechazo solo tiene sentido si la reseña está rechazada.
//
// Sin esto, el formulario invitaba a un estado imposible: escribir un motivo
// con el estado en "Pendiente". Guardar lo descarta igual —de eso se encarga
// save_model—, pero borrarle a alguien un texto que acaba de escribir, sin
// avisarle, es peor que no dejárselo escribir.
//
// Va en JavaScript y no en Python porque get_fields() decide qué campos se
// dibujan cuando se arma la página, una sola vez. Acá el estado cambia
// después, cuando el moderador toca el desplegable, y para entonces el
// servidor ya no está mirando.
document.addEventListener("DOMContentLoaded", function () {
  var estado = document.querySelector("#id_status");
  var fila = document.querySelector(".field-rejection_reason");

  // Si alguno no está, no hay nada que sincronizar: puede ser el formulario
  // de otro modelo, o que el campo haya pasado a solo lectura.
  if (!estado || !fila) {
    return;
  }

  function sincronizar() {
    // style.display y no el atributo `hidden`: el CSS del admin le da a
    // .form-row un display propio que le ganaría por especificidad.
    fila.style.display = estado.value === "rejected" ? "" : "none";
  }

  estado.addEventListener("change", sincronizar);

  // Y también al abrir la página, no solo al cambiar el desplegable: una
  // reseña ya rechazada tiene que mostrar su motivo apenas se abre.
  sincronizar();
});
