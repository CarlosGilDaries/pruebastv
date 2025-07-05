async function editUserForm() {
    let id = localStorage.getItem("id");
    const token = localStorage.getItem("auth_token");
    const backendAPI = "/api/";

    loadUserData(id);

    document
        .getElementById("edit-user-form")
        .addEventListener("submit", async function (e) {
            e.preventDefault();
            document.getElementById("edit-user-loading").style.display =
                "block";

            const formData = new FormData();
            formData.append(
                "name",
                document.getElementById("edit-user-name").value
            );
            formData.append(
                "surnames",
                document.getElementById("edit-user-surnames").value
            );
            formData.append(
                "email",
                document.getElementById("edit-user-email").value
            );
            formData.append(
                "dni",
                document.getElementById("edit-user-dni").value
            );
            formData.append(
                "address",
                document.getElementById("edit-user-address").value
            );
            formData.append(
                "city",
                document.getElementById("edit-user-city").value
            );
            formData.append(
                "country",
                document.getElementById("edit-user-country").value
            );
            formData.append(
                "birth_year",
                document.getElementById("edit-user-birth-year").value
            );
            formData.append(
                "gender",
                document.getElementById("edit-user-gender").value
            );
            formData.append(
                "plan",
                document.getElementById("edit-user-plan").value
            );
            formData.append(
              'role',
              document.getElementById('edit-user-role').value
            );
            if (document.getElementById('edit-user-password').value) {
                formData.append(
                    'password',
                    document.getElementById('edit-user-password').value
                );
                formData.append(
                  'password_confirmation',
                  document.getElementById('edit-user-password-confirmation')
                    .value
                );
            }

            try {
                const editResponse = await fetch(
                    backendAPI + `edit-user/${id}`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                        body: formData,
                    }
                );

                const data = await editResponse.json();

                if (data.success) {
                    document.getElementById(
                        "edit-user-success-message"
                    ).style.display = "block";
                    setTimeout(() => {
                        document.getElementById(
                            "edit-user-success-message"
                        ).style.display = "none";
                    }, 5000);
                    window.scrollTo({ top: 0, behavior: "smooth" });
                } else {
                    console.error("Error al editar:", data.message);
                }
            } catch (error) {
                console.error("Error:", error);
            } finally {
                document.getElementById("edit-user-loading").style.display =
                    "none";
            }
        });

    async function loadUserData(id) {
        try {
            const response = await fetch(backendAPI + `user/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const rolsResponse = await fetch('/api/roles' , {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const result = await response.json();
            const user = result.data.user;
            const plans = result.data.plans;
            const rolesData = await rolsResponse.json();
            const roles = rolesData.roles;

            document.getElementById("edit-user-name").value = user.name || "";
            document.getElementById("edit-user-surnames").value =
                user.surnames || "";
            document.getElementById("edit-user-email").value = user.email || "";
            document.getElementById("edit-user-dni").value = user.dni || "";
            document.getElementById("edit-user-address").value =
                user.address || "";
            document.getElementById("edit-user-city").value = user.city || "";
            document.getElementById("edit-user-country").value =
                user.country || "";
            document.getElementById("edit-user-birth-year").value =
                user.birth_year || "";
            document.getElementById("edit-user-gender").value =
                user.gender || "";

            const planSelect = document.getElementById("edit-user-plan");
            planSelect.innerHTML = "";
			const nulo = document.createElement("option");
			nulo.value = 0;
			nulo.text = 'Sin plan';
			planSelect.appendChild(nulo);
            plans.forEach((plan) => {
                const option = document.createElement("option");
                option.value = plan.id;
                option.text = plan.name;
                if (user.plan?.id === plan.id) {
                    option.selected = true;
                }
                planSelect.appendChild(option);
            });

            const roleSelect = document.getElementById('edit-user-role');
            roleSelect.innerHTML = '';
            const rolNulo = document.createElement('option');
            rolNulo.value = 0;
            rolNulo.text = 'Sin rol';
            roleSelect.appendChild(rolNulo);

            roles.forEach((role) => {
              const option = document.createElement('option');
              option.value = role.id;
              option.text = role.name;
              if (user.role?.id === role.id) {
                option.selected = true;
              }
              roleSelect.appendChild(option);
            });
        } catch (error) {
            console.error("Error cargando datos del usuario:", error);
        }
    }
}

editUserForm();