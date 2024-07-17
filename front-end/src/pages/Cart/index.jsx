import { Box, Button, IconButton, makeStyles, TextField, Typography } from '@material-ui/core';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import { FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { Field, Form, Formik } from 'formik';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import * as Yup from 'yup';
import { formatPrice } from '../../../src/utils/common';
import cartsApi from '../../api/cartApi';
import orderApi from '../../api/ordersApi';
import userApi from '../../api/userApi';
import SearchAddressField from '../../components/form-controls/SearchAddressField';
import { removeFromCart } from './cartSlice';
import CartClear from './components/CartClear';
import { styled } from '@mui/material/styles';

const CustomRadio = styled(Radio)({
  '&.Mui-checked': {
    color: 'black',
  },
});

const useStyles = makeStyles((theme) => ({
    root: {
        paddingBottom: theme.spacing(2),
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
    },
    name: {
        fontWeight: '700',
        fontFamily: 'monospace',
        marginBottom: '5px',
    },
    descriptionBox: {
        // fontFamily: 'Montserrat !important',
        fontFamily: 'monospace',
    },
    descriptionTitle: {
        fontWeight: '800',
        fontFamily: 'monospace',
        fontSize: '20px',
        borderTop: `1px solid ${theme.palette.grey[300]}`,
        marginTop: '10px',
    },
    description: {
        fontFamily: 'monospace',
        fontSize: '20px',
    },
    priceBox: {
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
        margin: '15px 0px',
    },
    salePrice: {
        marginRight: theme.spacing(1),
        fontSize: '18px',
        fontFamily: 'monospace',
        fontWeight: '600',
    },
    originalPrice: {
        marginRight: theme.spacing(1),
        fontSize: '18px',
        fontFamily: 'monospace',
        textDecoration: 'line-through',
        color: '#807D7C',
    },
    promotionPercent: {
        color: '#dc4136',
        fontSize: '18px',
        fontFamily: 'monospace',
        fontWeight: '500',
    },
    dialSize: {
        display: 'flex',
        marginTop: '10px',
        borderBottom: `1px solid ${theme.palette.grey[300]}`,
        margin: '15px 0px',
    },
    sizeName: {
        justifyContent: 'center',
        fontFamily: 'monospace',
        fontSize: '24px',
    },
    payment: {
        margin: '15px 0px',
    },
    policy: {
        display: 'flex',
        flexDirection: 'row',
        marginBottom: '.5rem',
        gap: '.8rem',
        '& > span': {
            color: '#807D7C',
            fontFamily: 'monospace',
            fontSize: '20px',
        },
    },
    cartContainer: {
        marginTop: '100px',
        display: 'flex',
        flexDirection: 'row',
        gap: theme.spacing(2),
    },
    cartImage: {
        width: '120px',
        height: '120px',
        objectFit: 'cover',
        marginRight: theme.spacing(2),
    },
    cartDetails: {
        display: 'flex',
        flexDirection: 'column',
    },
    cartItem: {
        width: '100%',
        display: 'flex',
        flexDirection: 'row',
        marginBottom: theme.spacing(2),
        justifyContent: ' space-between',
    },
    leftPanel: {
        width: '50%',
        borderRight: '1px solid black',
        padding: '20px',
    },
    rightPanel: {
        width: '50%',
        marginTop: '20px',
    },
    input: {
        fontFamily: 'monospace',
    },
    img: {
        height: '120px',
        width: '120px',
        marginRight: '15px',
    },
    item: {
        marginBottom: '10px',
    },
}));

const validationSchema = Yup.object().shape({
    // displayName: Yup.string().required('Required'),
    // email: Yup.string().email('Invalid email').required('Required'),
    // contactPhone: Yup.string().required('Required'),
});
function CartPages(props) {
    const [value, setValue] = React.useState('cod');

    const handleChangePay = (event) => {
        setValue(event.target.value);
    };
    const classes = useStyles();
    const cartItems = useSelector((state) => state.cart.cartItems);
    console.log('cartItems :', cartItems);
    const [cartList, setCartList] = useState([]);

    const userId = localStorage.getItem('userId');

    const [formData, setFormData] = useState({
        receiver: '',
        phone: '',
        address: '',
        adressDetail: '',
        isInCart: true,
    });

    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const { enqueueSnackbar } = useSnackbar();

    const handleRemoveItem = async (id) => {
        try {
            const userId = localStorage.getItem('userId');
            console.log('id :', id);
            const productIds = [id];
            console.log('productIds :', productIds);
            const req = await cartsApi.delete(userId, productIds);
            dispatch(removeFromCart(id));
            enqueueSnackbar('Đã xóa khỏi giỏ hàng!', { variant: 'error' });
        } catch (error) {
            enqueueSnackbar('Xóa sản phẩm khỏi giỏ hàng thất bại!', { variant: 'error' });
        }
    };

    useEffect(() => {
        if (!userId) {
            setError('No user ID found in local storage');
            return;
        }

        (async () => {
            try {
                const [cartList, userData] = await Promise.all([
                    cartsApi.getAll(userId),
                    userApi.getInfo(userId),
                ]);

                setCartList(cartList);
                console.log('cartList : ', cartList);
                setFormData(userData);
            } catch (error) {
                console.log('Failed to fetch data', error);
                setError('Failed to fetch data');
            }
        })();
    }, [userId]);

    // Button Buy Now
    // =========================================================

    const products = [];
    cartList.map((product) => {
        products.push({
            productId: product.productId,
            price: product.product[0].salePrice,
            quantity: product.quantity,
        });
    });
    // =========================================================

    const handleBuyNow = async (values) => {
        const shippingInfo = {
            receiver: values.displayName,
            phone: values.contactPhone,
            address: values.address,
            adressDetail: values.adressDetail,
        };
        const payloadPay = { userId, products, shippingInfo };

        if (!userId) {
            return;
        }
        try {
            console.log('payloadPay :', payloadPay);
            const req = await orderApi.add(payloadPay);
            enqueueSnackbar('Đã mua hàng thành công', { variant: 'success' });
        } catch (error) {
            enqueueSnackbar('Đã xảy ra lỗi! Vui lòng thử lại sau.', { variant: 'error' });
        }
    };

    return (
        <Box>
            {cartItems.length === 0 ? (
                <CartClear />
            ) : (
                <Box className={classes.cartContainer}>
                    <Box className={classes.leftPanel}>
                        <Box className={classes.leftPanelUp}>
                            <Box className={classes.address}>
                                <Typography
                                    component='h1'
                                    variant='h5'
                                    style={{ fontFamily: 'monospace', marginBottom: '20px' }}
                                >
                                    Thông tin vận chuyển
                                </Typography>
                                <Formik
                                    initialValues={formData}
                                    enableReinitialize
                                    validationSchema={validationSchema}
                                    onSubmit={handleBuyNow}
                                >
                                    {({ handleChange, handleBlur }) => (
                                        <Form className={classes.wrapper}>
                                            <Form className={classes.wrapper}>
                                                <Box className={classes.item}>
                                                    <Typography className={classes.name}>
                                                        Tên người đặt
                                                    </Typography>
                                                    <Field
                                                        as={TextField}
                                                        name='displayName'
                                                        className={classes.input}
                                                        variant='outlined'
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth={true}
                                                        fontFamily='monospace'
                                                    />
                                                </Box>
                                                <Box className={classes.item}>
                                                    <Typography className={classes.name}>
                                                        Địa chỉ ( quận , thành phố )
                                                    </Typography>
                                                    <Field
                                                        as={SearchAddressField}
                                                        name='address'
                                                        className={classes.input}
                                                        variant='outlined'
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth={true}
                                                    />
                                                </Box>
                                                <Box className={classes.item}>
                                                    <Typography className={classes.name}>
                                                        Số nhà{' '}
                                                    </Typography>
                                                    <Field
                                                        as={TextField}
                                                        name='adressDetail'
                                                        className={classes.input}
                                                        variant='outlined'
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth={true}
                                                    />
                                                </Box>

                                                <Box className={classes.item}>
                                                    <Typography className={classes.name}>
                                                        Số điện thoại
                                                    </Typography>
                                                    <Field
                                                        as={TextField}
                                                        name='contactPhone'
                                                        className={classes.input}
                                                        variant='outlined'
                                                        onChange={handleChange}
                                                        onBlur={handleBlur}
                                                        fullWidth={true}
                                                    />
                                                </Box>
                                                <Box sx={{ padding: 2 }}>
                                                <FormControl component='fieldset'>
                                                    <FormLabel component='legend'>
                                                        <Typography
                                                            component='h1'
                                                            variant='h5'
                                                            style={{
                                                                fontFamily: 'monospace',
                                                                marginBottom: '20px',
                                                                color:'black'
                                                            }}
                                                        >
                                                            Hình thức thanh toán
                                                        </Typography>
                                                    </FormLabel>
                                                    <RadioGroup
                                                        aria-label='payment-method'
                                                        name='payment-method'
                                                        value={value}
                                                        onChange={handleChangePay}
                                                    >
                                                        <FormControlLabel
                                                            value='bank-transfer'
                                                            control={<CustomRadio />}
                                                            label={
                                                                <Box
                                                                    display='flex'
                                                                    alignItems='center'
                                                                >
                                                                    <AccountBalanceIcon
                                                                        color='black'
                                                                        sx={{ marginRight: 1 }}
                                                                    />
                                                                    <Box>
                                                                        <Typography variant='body1'>
                                                                            Chuyển khoản ngân hàng
                                                                        </Typography>
                                                                        <Typography variant='body2'>
                                                                            Thực hiện thanh toán vào
                                                                            ngay tài khoản ngân hàng
                                                                            của chúng tôi. Vui lòng
                                                                            sử dụng Mã đơn hàng của
                                                                            bạn trong phần Nội dung
                                                                            thanh toán. Đơn hàng sẽ
                                                                            được giao sau khi tiền
                                                                            đã chuyển.
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            }
                                                        />
                                                        <FormControlLabel
                                                            value='cod'
                                                            control={<CustomRadio />}
                                                            label={
                                                                <Box
                                                                    display='flex'
                                                                    alignItems='center'
                                                                >
                                                                    <LocalShippingIcon
                                                                        color='black'
                                                                        sx={{ marginRight: 1 }}
                                                                    />
                                                                    <Box>
                                                                        <Typography variant='body1'>
                                                                            Trả tiền mặt khi nhận
                                                                            hàng
                                                                        </Typography>
                                                                        <Typography variant='body2'>
                                                                            Trả tiền mặt khi giao
                                                                            hàng
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            }
                                                        />
                                                    </RadioGroup>
                                                </FormControl>
                                            </Box>
                                            </Form>
                                            {/* <Box sx={{ padding: 2 }}>
                                                <FormControl component='fieldset'>
                                                    <FormLabel component='legend'>
                                                        <Typography
                                                            component='h1'
                                                            variant='h5'
                                                            style={{
                                                                fontFamily: 'monospace',
                                                                marginBottom: '20px',
                                                                color:'black'
                                                            }}
                                                        >
                                                            Hình thức thanh toán
                                                        </Typography>
                                                    </FormLabel>
                                                    <RadioGroup
                                                        aria-label='payment-method'
                                                        name='payment-method'
                                                        value={value}
                                                        onChange={handleChangePay}
                                                    >
                                                        <FormControlLabel
                                                            value='bank-transfer'
                                                            control={<CustomRadio />}
                                                            label={
                                                                <Box
                                                                    display='flex'
                                                                    alignItems='center'
                                                                >
                                                                    <AccountBalanceIcon
                                                                        color='black'
                                                                        sx={{ marginRight: 1 }}
                                                                    />
                                                                    <Box>
                                                                        <Typography variant='body1'>
                                                                            Chuyển khoản ngân hàng
                                                                        </Typography>
                                                                        <Typography variant='body2'>
                                                                            Thực hiện thanh toán vào
                                                                            ngay tài khoản ngân hàng
                                                                            của chúng tôi. Vui lòng
                                                                            sử dụng Mã đơn hàng của
                                                                            bạn trong phần Nội dung
                                                                            thanh toán. Đơn hàng sẽ
                                                                            được giao sau khi tiền
                                                                            đã chuyển.
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            }
                                                        />
                                                        <FormControlLabel
                                                            value='cod'
                                                            control={<CustomRadio />}
                                                            label={
                                                                <Box
                                                                    display='flex'
                                                                    alignItems='center'
                                                                >
                                                                    <LocalShippingIcon
                                                                        color='black'
                                                                        sx={{ marginRight: 1 }}
                                                                    />
                                                                    <Box>
                                                                        <Typography variant='body1'>
                                                                            Trả tiền mặt khi nhận
                                                                            hàng
                                                                        </Typography>
                                                                        <Typography variant='body2'>
                                                                            Trả tiền mặt khi giao
                                                                            hàng
                                                                        </Typography>
                                                                    </Box>
                                                                </Box>
                                                            }
                                                        />
                                                    </RadioGroup>
                                                </FormControl>
                                            </Box> */}
                                            <Box
                                                style={{
                                                    justifyContent: 'center',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Button
                                                    className={classes.button}
                                                    variant='contained'
                                                    color='primary'
                                                    type='submit'
                                                    style={{
                                                        marginTop: '20px',
                                                        background: 'black',
                                                        borderRadius: '0px',
                                                        fontFamily: 'monospace',
                                                    }}
                                                >
                                                    Đặt hàng
                                                </Button>
                                            </Box>
                                        </Form>
                                    )}
                                </Formik>
                            </Box>
                        </Box>
                    </Box>
                    <Box className={classes.rightPanel}>
                        <Typography
                            component='h1'
                            variant='h5'
                            style={{ fontFamily: 'monospace', marginBottom: '20px' }}
                        >
                            Giỏ hàng
                        </Typography>
                        {cartList.map((cartItem) => (
                            <Box key={cartItem._id}>
                                {cartItem.product.map((productItem, index) => (
                                    <Box
                                        key={index}
                                        className={classes.cartItem}
                                    >
                                        <Box className={classes.img}>
                                            <img
                                                src={
                                                    productItem.images[0]
                                                        ? `${productItem.images[0]}`
                                                        : 'https://via.placeholder.com/444'
                                                }
                                                alt={productItem.name}
                                                className={classes.cartImage}
                                            />
                                        </Box>
                                        <Box className={classes.cartDetails}>
                                            <Typography
                                                component='h1'
                                                variant='h5'
                                                className={classes.name}
                                            >
                                                {productItem.name}
                                            </Typography>
                                            <Typography
                                                component='p'
                                                className={classes.description}
                                            >
                                                Quantity: {cartItem.quantity}
                                            </Typography>
                                            <Typography
                                                component='p'
                                                className={classes.salePrice}
                                            >
                                                {formatPrice(productItem.salePrice)}
                                            </Typography>
                                        </Box>
                                        <Box>
                                            <IconButton
                                                onClick={() => handleRemoveItem(productItem._id)}
                                            >
                                                <DeleteOutlineIcon />
                                            </IconButton>
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}
        </Box>
    );
}

CartPages.propTypes = {
    // Define prop types if any
};

export default CartPages;
