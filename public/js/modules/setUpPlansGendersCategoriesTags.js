export async function setupPlansGendersCategoriesTags(authToken) {
  try {
    const plansContainer = document.getElementById('plans-container');
    const categoriesContainer = document.getElementById('categories-container');
    const tagsContainer = document.getElementById('tags-container');

    const gendersContainer = document.getElementById('genders-container');
    const response = await fetch('/api/plans');
    const tagsResponse = await fetch('/api/tags');
    const genderResponse = await fetch('/api/genders', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });
    const categoryResponse = await fetch('/api/dropdown-categories-menu', {
      headers: {
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    const genderData = await genderResponse.json();
    const categoryData = await categoryResponse.json();
    const tagsData = await tagsResponse.json();

    const plans = data.plans;
    const genders = genderData.genders;
    const categories = categoryData.categories;
    const tags = tagsData.tags;

    // Llenar planes
    plans.forEach((plan) => {
      const div = document.createElement('div');
      div.className = 'form-check';

      const input = document.createElement('input');
      input.className = 'form-check-input';
      input.type = 'checkbox';
      input.value = plan.id;
      input.id = `plan-${plan.id}`;
      input.name = 'plans[]';

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = `plan-${plan.id}`;
      label.textContent = plan.name;

      div.appendChild(input);
      div.appendChild(label);
      plansContainer.appendChild(div);
    });

    // Llenar categorías
    categories.forEach((category) => {
      const div = document.createElement('div');
      div.className = 'form-check';

      const input = document.createElement('input');
      input.className = 'form-check-input';
      input.type = 'checkbox';
      input.value = category.id;
      input.id = `category-${category.id}`;
      input.name = 'categories[]';

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = `category-${category.id}`;
      label.textContent = category.name;

      div.appendChild(input);
      div.appendChild(label);
      categoriesContainer.appendChild(div);
    });

    // Llenar etiquetas
    tags.forEach((tag) => {
      const div = document.createElement('div');
      div.className = 'form-check';

      const input = document.createElement('input');
      input.className = 'form-check-input';
      input.type = 'checkbox';
      input.value = tag.id;
      input.id = `tag-${tag.id}`;
      input.name = 'tags[]';

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = `tag-${tag.id}`;
      label.textContent = tag.name;

      div.appendChild(input);
      div.appendChild(label);
      tagsContainer.appendChild(div);
    });

    // Llenar géneros
    genders.forEach((gender) => {
      const div = document.createElement('div');
      div.className = 'form-check';

      const input = document.createElement('input');
      input.className = 'form-check-input';
      input.type = 'checkbox';
      input.value = gender.id;
      input.id = `gender-${gender.id}`;
      input.name = 'genders[]';

      const label = document.createElement('label');
      label.className = 'form-check-label';
      label.htmlFor = `gender-${gender.id}`;
      label.textContent = gender.name;

      div.appendChild(input);
      div.appendChild(label);
      gendersContainer.appendChild(div);
    });
  } catch (error) {
    console.error('Error al cargar datos:', error);
  }
}
