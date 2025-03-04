const jobsItemsList = document.querySelector('#jobs-list');

const addJob = (entry, jobData) => {
  if (!entry[jobData.title]) {
    entry[jobData.title] = {};
  }
  appendLocations(entry[jobData.title], jobData)
}

const getDeterminedCountry = (country) => {
  return country.length === 0 ? 'Worldwide' : country;
}



const appendLocations = (entry, jobData) => {
  const newLocation = {
    city: jobData.city,
    country: getDeterminedCountry(jobData.country),
    url: jobData.url,
    workType: jobData.telecommuting ? 'Remote' : 'Hybrid',
    location:  hasHybridCity(jobData.city) ? jobData.city : getDeterminedCountry(jobData.country) 
  }


  if (!entry.locations) {
    entry.locations = [];
  }
  entry.locations.push(newLocation)
}

const createJobsObject = (jsonData) => {
  const jobs = {};

   jsonData.map((job) => {
    if (!jobs[job.department]) {
      jobs[job.department] = {} 
    }
    addJob(jobs[job.department], job)
  })
  return jobs;
}


async function fetchJobs() {
  try {
    const urlEndpoint = "/_hcms/api/get_all_jobs";
    const response = await fetch(urlEndpoint);
    const data = await response.json();
    const jobsData = data.response.jobs

    displayJobs(jobsData)
    displayDropdownButtons(filterUniqueJobTitles(jobsData), 'roles');
    displayDropdownButtons(filterUniqueLocations(jobsData), 'locations');

  } catch (error) {
    console.error(error)
  }
}

const filterUniqueJobTitles = (data) => {
  return [...new Set(data.map(job => job.title))];
}

const filterUniqueLocations = (data) => {
  return [...new Set(data.map(job => hasHybridCity(job.city) ? job.city : getDeterminedCountry(job.country)))];
}

const convertToPascalCase = (string) => {
  return string.split(" ").join("");
}

const convertToDashCase = (string) => {
  return string.split(" ").join("-").toLowerCase();
}


const displayDropdownButtons = (filteredItems, idSelector) =>{
  const htmlItems = filteredItems.map((item) => {
    return `
      <li>
        <input type="checkbox" id="${convertToDashCase(item)}" class="jobs__filter-dropdown-option" name="${item}" data-category="${idSelector}"/>
        <label for="${convertToDashCase(item)}">
         ${item}
        </label>
      </li>
    `
  }).join('');

  const divSelector = document.querySelector(`#${idSelector}`)
  divSelector.innerHTML = htmlItems;

}


const hasHybridCity = (city) => {
  if(city === 'London' || city === 'Manchester' || city === 'Barcelona' ){
      return true;
  }
}


const renderApplyBtnLang = () => {
 return location.pathname.includes('/es/') ? "Aplicar" : "Apply";
}


const renderLocations = (locationsArray) => {
  return locationsArray.map(({city, country, url, location, workType}) => `
  <div class="job-list__position">
    <p class="job-item__workType" data-workType="${workType}">${workType}</p>
    <p class="job-item__location">
      <i class="las la-map-marker"></i>
      ${ location }
    </p>
    <a class="job-item__link text-cta-primary
    text-cta--right-arrow"
    href=${url}
    target=_blank>${renderApplyBtnLang()}<i class="las la-arrow-right"></i>
    </a>
  </div>
  `).join('');
}

const displayJobs = (jobsData) => {
  const jobs = createJobsObject(jobsData)

  const htmlRender = Object.entries(jobs).map( ([departmentName, jobInfo]) => {
    return  ` 
      <div class="job-item__section">
        <p class="job-item__department">${departmentName}</p>
          ${Object.entries(jobInfo).map( ([jobTitle, {locations}]) => {             
            return `
            <div class="job-item__titles-container">
              <h3 id=${convertToPascalCase(jobTitle)} class="job-item__title">${jobTitle}</h3>
              <div class="job-list__position-wrapper">
                ${renderLocations(locations)}
              </div>
            </div>`
            }).join('')
          }
      </div>
      `
  }).join('')


  jobsItemsList.innerHTML = htmlRender;
 
}


const hide = (element) => {
  element.classList.add('hidden');
}

const show = (element) => {
  element.classList.remove('hidden');
}

const showDropdown = (container, eventTarget) => {
  show(container);
  eventTarget.classList.add('jobs__filter-dropdown-button--active');
}

const hideDropdown = (container, eventTarget) => {
  hide(container);
  eventTarget.classList.remove('jobs__filter-dropdown-button--active');
}

const closeAllDropdowns = () => {
  const allContainers = document.querySelectorAll(".jobs__filter-dropdown-container");

  allContainers.forEach( element => {
      element.children[0].classList.remove('jobs__filter-dropdown-button--active');
      element.children[1].classList.add('hidden');
  } )
}


const hideEmptySections = () => {
  const allSections = document.querySelectorAll('.job-item__section');
  allSections.forEach( section => {
    const jobTitles = Array.from(section.querySelectorAll('.job-item__titles-container'));
    
    allItemsAreHidden(jobTitles) ? hide(section) : show(section);
  });
}


const checkEmptyResults = () => {
  const allSections = Array.from(document.querySelectorAll('.job-item__section'));
  const notFoundMessage = document.querySelector('.job-item__not-found');

  if(allItemsAreHidden(allSections)){
    show(notFoundMessage)
  }else{
    hide(notFoundMessage);
  }

}


document.addEventListener('click', (event) => {
  const target = event.target;
  const buttonToggle = target.dataset.dropdownButton;

  if(!buttonToggle && !event.target.closest('[data-dropdown-container]')) {
    closeAllDropdowns();
    return;
  } 
  
  if (buttonToggle) {
    const dropdownOptions = document.getElementById(buttonToggle);
    
    if(dropdownOptions.classList.contains('hidden')){
      closeAllDropdowns();
      showDropdown(dropdownOptions, target);
    }else{
      hideDropdown(dropdownOptions, target);
    }
  };

})


const getCheckedEntries = (list, filterTerm) => {
  return Array.from(list)
          .filter(el => el.dataset.category === filterTerm)
          .filter(el => el.checked)
          .map(el => el.name)
}

const removeElementFromArray = (arr, name) => arr.filter(el => el !== name);

const addElementToArray = (arr, name) => [...arr, name];

const filterIsEmpty = filter => filter.length === 0;

const filterIncludes = (filter, item) => filter.includes(item);

const allItemsAreHidden = (arr) => arr.every(el => el.classList.contains('hidden'));

const setBaseFilterState = (form) => {
  const formRoles = getCheckedEntries(form.elements, 'roles');
  const formLocations = getCheckedEntries(form.elements, 'locations')
  const formWorkType = form.elements.workType.value;

  return {
    roles: formRoles,
    locations: formLocations,
    workType: formWorkType
  }
}


const renderFilteredResults = (filterState) => {

  const jobListings = document.querySelectorAll('.job-item__titles-container');

  for(const jobListing of jobListings){
    const jobTitle = jobListing.querySelector('.job-item__title').innerText;
    const jobPositions = Array.from(jobListing.querySelectorAll('.job-list__position'))

    if ( filterIncludes(filterState.roles, jobTitle) || filterIsEmpty(filterState.roles) ) {
      show(jobListing)
    }  else {
      hide(jobListing)
    }

    for (const jobPosition of jobPositions) {
      const jobLocation = jobPosition.querySelector('.job-item__location').innerText.trim();
      const jobWorkType = jobPosition.querySelector('[data-workType]').innerText.trim();


      if (
        (filterIncludes(filterState.locations, jobLocation)
        || filterIsEmpty(filterState.locations))
        && (filterState.workType === jobWorkType
        || filterState.workType === 'All')
      ) {
        show(jobPosition);
      } else {
        hide(jobPosition);
      }
    }

    if(allItemsAreHidden(jobPositions)){
      hide(jobListing);
    }

  } 
}

const updateFilterState = async ({target: {type, checked, dataset, name, value}}, filterState) => {
  switch (type) {
    case 'checkbox': {
      if (checked) {
        filterState[dataset.category] = addElementToArray(filterState[dataset.category], name)
      } else {
        filterState[dataset.category] = removeElementFromArray(filterState[dataset.category], name)
      }
      break;
    }
    case 'radio': {
      filterState[name] = value;
      break;
    }
  }
};

const handleFilterFormChange = async (e, filterState) => {
 await updateFilterState(e, filterState);
  renderFilteredResults(filterState);
  hideEmptySections();
  checkEmptyResults();
}

window.addEventListener('DOMContentLoaded', async () => {
  await fetchJobs();

  const filterForm = document.forms['filter-form'];
  let filterState = setBaseFilterState(filterForm);

  filterForm.addEventListener('change', e => handleFilterFormChange(e, filterState))
})
