document.addEventListener("DOMContentLoaded", function () {

    const paymentForm = document.getElementById("paymentForm");

    const mobileMoneyFields =
        document.getElementById("mobileMoneyFields");

    const cardFields =
        document.getElementById("cardFields");

    const paymentMethods =
        document.querySelectorAll(
            'input[name="paymentMethod"]'
        );

    const successModalElement =
        document.getElementById("successModal");

    const successModal =
        new bootstrap.Modal(successModalElement);

    const transactionReference =
        document.getElementById(
            "transactionReference"
        );


    /* =====================================================
       CHANGEMENT DU MOYEN DE PAIEMENT
    ===================================================== */

    paymentMethods.forEach(function (method) {

        method.addEventListener("change", function () {

            if (this.value === "card") {

                cardFields.classList.remove("d-none");
                mobileMoneyFields.classList.add("d-none");

            } else {

                mobileMoneyFields.classList.remove("d-none");
                cardFields.classList.add("d-none");

            }

        });

    });


    /* =====================================================
       FORMAT NUMERO CARTE
    ===================================================== */

    const cardNumber =
        document.getElementById("cardNumber");

    if (cardNumber) {

        cardNumber.addEventListener("input", function () {

            let value =
                this.value.replace(/\D/g, "");

            value =
                value.substring(0, 16);

            let formatted =
                value.match(/.{1,4}/g);

            this.value =
                formatted
                    ? formatted.join(" ")
                    : "";

        });

    }


    /* =====================================================
       FORMAT DATE EXPIRATION
    ===================================================== */

    const expiry =
        document.getElementById("expiry");

    if (expiry) {

        expiry.addEventListener("input", function () {

            let value =
                this.value.replace(/\D/g, "");

            value =
                value.substring(0, 4);

            if (value.length > 2) {

                value =
                    value.substring(0, 2)
                    + "/"
                    + value.substring(2);

            }

            this.value = value;

        });

    }


    /* =====================================================
       SOUMISSION
    ===================================================== */

    paymentForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();


            const selectedMethod =
                document.querySelector(
                    'input[name="paymentMethod"]:checked'
                );


            if (!selectedMethod) {

                alert(
                    "Veuillez choisir un moyen de paiement."
                );

                return;

            }


            /* Validation Mobile Money */

            if (
                selectedMethod.value === "mobile_money"
            ) {

                const phone =
                    document.getElementById("phone").value.trim();

                if (!phone) {

                    alert(
                        "Veuillez saisir votre numéro Mobile Money."
                    );

                    return;

                }

            }


            /* Validation carte */

            if (
                selectedMethod.value === "card"
            ) {

                const number =
                    document.getElementById(
                        "cardNumber"
                    ).value.trim();

                const expiration =
                    document.getElementById(
                        "expiry"
                    ).value.trim();

                const cvv =
                    document.getElementById(
                        "cvv"
                    ).value.trim();

                const name =
                    document.getElementById(
                        "cardName"
                    ).value.trim();


                if (
                    !number ||
                    !expiration ||
                    !cvv ||
                    !name
                ) {

                    alert(
                        "Veuillez compléter toutes les informations de la carte."
                    );

                    return;

                }

            }


            /* =================================================
               GENERATION REFERENCE
            ================================================= */

            const randomNumber =
                Math.floor(
                    100000 +
                    Math.random() * 900000
                );

            transactionReference.textContent =
                "BIDE-" + randomNumber;


            /* =================================================
               AFFICHAGE SUCCES
            ================================================= */

            successModal.show();

        }
    );

});
