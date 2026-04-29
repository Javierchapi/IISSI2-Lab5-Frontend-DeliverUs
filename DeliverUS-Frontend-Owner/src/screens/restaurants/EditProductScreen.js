import { useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { MaterialCommunityIcons } from '@expo/vector-icons'
import * as yup from 'yup'
import DropDownPicker from 'react-native-dropdown-picker'
import {
  getDetail,
  update,
  getProductCategories
} from '../../api/ProductEndpoints'
import InputItem from '../../components/InputItem'
import TextRegular from '../../components/TextRegular'
import * as GlobalStyles from '../../styles/GlobalStyles'
// IMPORTANTE: Verifica que la ruta y el nombre de la imagen por defecto sean correctos en tu proyecto
import productImage from '../../../assets/product.jpeg'
import { showMessage } from 'react-native-flash-message'
import { ErrorMessage, Formik } from 'formik'
import TextError from '../../components/TextError'
import { prepareEntityImages } from '../../api/helpers/FileUploadHelper'
import { buildInitialValues } from '../Helper'
import ImagePicker from '../../components/ImagePicker'

export default function EditProductScreen({ navigation, route }) {
  const [open, setOpen] = useState(false)
  const [productCategories, setProductCategories] = useState([])
  const [backendErrors, setBackendErrors] = useState()
  const [product, setProduct] = useState({})

  // Valores iniciales adaptados a un Producto
  const [initialProductValues, setInitialProductValues] = useState({
    name: null,
    description: null,
    price: null,
    productCategoryId: null,
    image: null
  })

  // Esquema de validación para un Producto
  const validationSchema = yup.object().shape({
    name: yup.string().max(255, 'Name too long').required('Name is required'),
    description: yup.string().max(255, 'Description too long'),
    price: yup
      .number()
      .positive('Please provide a valid price')
      .required('Price is required'),
    productCategoryId: yup
      .number()
      .positive()
      .integer()
      .required('Product category is required')
  })

  // Cargar las categorías de productos para el DropDown
  useEffect(() => {
    async function fetchProductCategories() {
      try {
        const fetchedProductCategories = await getProductCategories()
        const productCategoriesList = fetchedProductCategories.map(
          category => ({
            label: category.name,
            value: category.id
          })
        )
        setProductCategories(productCategoriesList)
      } catch (error) {
        console.log(error)
      }
    }
    fetchProductCategories()
  }, [])

  // Cargar los detalles del producto a editar
  useEffect(() => {
    async function fetchProductDetail() {
      try {
        const fetchedProduct = await getDetail(route.params.id)
        const preparedProduct = prepareEntityImages(fetchedProduct, ['image'])
        setProduct(preparedProduct)
        const initialValues = buildInitialValues(
          preparedProduct,
          initialProductValues
        )
        setInitialProductValues(initialValues)
      } catch (error) {
        showMessage({
          message: `There was an error while retrieving product details (id ${route.params.id}). ${error}`,
          type: 'error',
          style: GlobalStyles.flashStyle,
          titleStyle: GlobalStyles.flashTextStyle
        })
      }
    }
    fetchProductDetail()
  }, [route])

  // Función para actualizar
  const updateProduct = async values => {
    setBackendErrors([])
    try {
      const updatedProduct = await update(product.id, values)
      showMessage({
        message: `Product ${updatedProduct.name} succesfully updated`,
        type: 'success',
        style: GlobalStyles.flashStyle,
        titleStyle: GlobalStyles.flashTextStyle
      })
      // Volvemos a la pantalla anterior (Detalles del restaurante)
      navigation.goBack()
    } catch (error) {
      console.log(error)
      setBackendErrors(error.errors)
    }
  }

  return (
    <Formik
      validationSchema={validationSchema}
      enableReinitialize
      initialValues={initialProductValues}
      onSubmit={updateProduct}
    >
      {({ handleSubmit, setFieldValue, values }) => (
        <ScrollView>
          <View style={{ alignItems: 'center' }}>
            <View style={{ width: '60%' }}>
              <InputItem name="name" label="Name:" />
              <InputItem name="description" label="Description:" />
              <InputItem name="price" label="Price:" />

              <DropDownPicker
                open={open}
                value={values.productCategoryId}
                items={productCategories}
                setOpen={setOpen}
                onSelectItem={item => {
                  setFieldValue('productCategoryId', item.value)
                }}
                setItems={setProductCategories}
                placeholder="Select the product category"
                containerStyle={{ height: 40, marginTop: 20 }}
                style={{ backgroundColor: GlobalStyles.brandBackground }}
                dropDownStyle={{ backgroundColor: '#fafafa' }}
                zIndex={1000}
              />
              <ErrorMessage
                name={'productCategoryId'}
                render={msg => <TextError>{msg}</TextError>}
              />

              <ImagePicker
                label="Image:"
                image={values.image}
                defaultImage={productImage}
                onImagePicked={result => setFieldValue('image', result)}
              />

              {backendErrors &&
                backendErrors.map((error, index) => (
                  <TextError key={index}>
                    {error.param}-{error.msg}
                  </TextError>
                ))}

              <Pressable
                onPress={handleSubmit}
                style={({ pressed }) => [
                  {
                    backgroundColor: pressed
                      ? GlobalStyles.brandSuccessTap
                      : GlobalStyles.brandSuccess
                  },
                  styles.button
                ]}
              >
                <View
                  style={[
                    { flex: 1, flexDirection: 'row', justifyContent: 'center' }
                  ]}
                >
                  <MaterialCommunityIcons
                    name="content-save"
                    color={'white'}
                    size={20}
                  />
                  <TextRegular textStyle={styles.text}>Save</TextRegular>
                </View>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      )}
    </Formik>
  )
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    height: 40,
    padding: 10,
    width: '100%',
    marginTop: 20,
    marginBottom: 20
  },
  text: {
    fontSize: 16,
    color: 'white',
    textAlign: 'center',
    marginLeft: 5
  },
  imagePicker: {
    height: 40,
    paddingLeft: 10,
    marginTop: 20,
    marginBottom: 80
  },
  image: {
    width: 100,
    height: 100,
    borderWidth: 1,
    alignSelf: 'center',
    marginTop: 5
  }
})
