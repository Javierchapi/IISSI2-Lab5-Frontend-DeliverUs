import { get, post, put, destroy } from './helpers/ApiRequestsHelper'
function getAll() {
  return get('users/myrestaurants')
}

function getDetail(id) {
  return get(`restaurants/${id}`)
}

function getRestaurantCategories() {
  return get('restaurantCategories')
}

function create(data) {
  return post('restaurants', data)
}
function remove(id) {
  return destroy(`restaurants/${id}`)
}
function update(id, data) {
  return put(`restaurants/${id}`, data)
}

export { getAll, getDetail, getRestaurantCategories, create, remove, update }
