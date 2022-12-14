import { useNavigation } from '@react-navigation/native';
import React, { useState, useEffect, useContext, useMemo } from 'react';
import { AuthContext } from 'src/auth';
import { StyleSheet, View, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { Text, Image } from 'react-native-elements';
import { Octicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Header, BackBtn, SearchInput, Dialog, Button } from "src/shared/uielements";
import { baseHeader, viewBase, dialogViewBase, wrappingContainerBase, FontFamily } from "src/theme/elements";
import { colors } from "src/theme/colors";
import MyTransactionList from './MyTransactionList';
import MyTransactionFilter, { customerTransactionTypes } from './MyTransactionsFilter';
import ReturnQRCodeGen from './ReturnQRCodeGen';
import Translation from 'src/translation/en.json';
import * as Routes from 'src/navigation/constants';
import { getBerksharePrefix } from "src/utils/common";
import { TransactionType, LoadingScreenTypes } from "src/utils/types";
import { ITransaction } from 'src/api/types';
import { loadPersonalTransactions } from 'src/store/transaction/transaction.actions';
import { TransactionState } from 'src/store/transaction/transaction.reducer';
import { useSelector, useDispatch } from 'react-redux';
import { AppState } from 'src/store';
import moment from 'moment';
import { WalletState } from 'src/store/wallet/wallet.reducer';
import { updateLoadingStatus } from 'src/store/loading/loading.actions';
import { BUTTON_TYPES } from 'src/constants';
import PaymentRequestSuccess from 'src/screens/payment/PaymentRequestSuccess';

const styles = StyleSheet.create({
	content: {
		flex: 1,
	},
	headerText: {
		fontSize: 32,
		fontWeight: '400',
		lineHeight: 35
	},
	totalAmountView: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 10,
		paddingBottom: 5,
		borderBottomWidth: 1,
		borderBottomColor: colors.darkGreen
	},
	amountText: {
		fontFamily: FontFamily.bold,
		fontWeight: 'bold',
		fontSize: 18
	},
	filterView: {
		flexDirection: 'row',
		justifyContent: 'space-between',
	},
	searchInput: {
		flex: 1,
		marginRight: 10
	},
	filterBtn: {
		width: 55,
		height: 55,
		marginTop: 8,
		borderRadius: 3,
		backgroundColor: colors.inputBg,
		alignItems: 'center',
		justifyContent: 'center'
	},
	selectedFilterBtn: {
		width: 55,
		height: 55,
		marginTop: 8,
		borderRadius: 3,
		backgroundColor: colors.darkGreen,
		alignItems: 'center',
		justifyContent: 'center'
	},
	scanButton: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		width: '90%',
		height: 55,
		position: 'absolute',
		bottom: 45,
		color: colors.white,
		backgroundColor: colors.darkGreen,
		alignSelf: 'center',
		borderRadius: 30
	},
	scanBtnText: {
		color: colors.white
	},
	qrIcon: {
		width: 24,
		height: 24,
		marginRight: 20
	},
	headerView: {
		marginTop: 20,
		marginBottom: 40
	},
	detailView: {
		flexDirection: 'row', 
		justifyContent: 'space-between'
	},
	detailText: {
		fontSize: 10,
		// marginHorizontal: 10,
		color: colors.bodyText
	},
	returnText: {
		color: colors.darkRed
	},
	minusText: {
		fontFamily: FontFamily.bold,
		fontSize: 32,
		lineHeight: 32,
		color: colors.darkRed,
		textAlign: 'center'
	},
	plusText: {
		fontFamily: FontFamily.bold,
		fontSize: 32,
		lineHeight: 32,
		color: colors.darkGreen,
		textAlign: 'center'
	},
	dialogHeight: {
		height: 300
	},
	// absolute calendar
	dataRangeView: {
		position: 'absolute',
		left: 0,
		top: 250,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 5,
		paddingHorizontal: 10,
        alignItems: 'center'
    },
    dateView: {
        flex: 1,
    },
    date: {
        height: 55,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 3,
        backgroundColor: colors.inputBg
    },
    separator: {
        width: 15,
        height: 1,
        marginHorizontal: 10,
        marginTop: 15,
        backgroundColor: colors.darkGreen
    },
	placeholder: {
        color: colors.lightGreen
    },
});

type TransactionDetailProps = {
	visible: boolean,
	data: ITransaction,
	onClose: ()=>void,
	onReturn: ()=>void
}

const TransactionDetail = (props: TransactionDetailProps) => {
	const {data, visible, onClose } = props;

	const getStyle = (type: string) => {
		if (type === TransactionType.SALE || type === TransactionType.RETURN || type === TransactionType.IN) {
			return styles.plusText;
		} else {
			return styles.minusText;
		}
	}

	return (
		<Dialog visible={visible} onClose={onClose} style={styles.dialogHeight}>
			<View style={dialogViewBase}>
				<ScrollView style={wrappingContainerBase}>
					<View style={styles.headerView}>
						<Text style={getStyle(data.type)}> {getBerksharePrefix(data.type)} {data.value} </Text>
					</View>

					<View style={styles.detailView}>
						<Text style={styles.detailText}>{Translation.PAYMENT.TRANSACTION_ID}</Text>
						<Text style={styles.detailText}>{data.transactionHash}</Text>
					</View>
					<View style={styles.detailView}>
						<Text style={styles.detailText}>TYPE</Text>
						<Text style={styles.detailText}>{data.type}</Text>
					</View>
					<View style={styles.detailView}>
						<Text style={styles.detailText}>DATE</Text>
						<Text style={styles.detailText}>{moment(data.timestamp).format('HH:mm, MMM D, YYYY')}</Text>
					</View>
				</ScrollView>
				{TransactionType.OUT === data.type && (
					<View>
						<Button
							type={BUTTON_TYPES.TRANSPARENT}
							title={Translation.BUTTON.WANT_RETURN}
							textStyle={styles.returnText}
							onPress={props.onReturn}
						/>
					</View>
				)}
			</View>
		</Dialog>
	)
}

const defaultTransaction = {
	transactionHash: "",
	toUserId: "",
	toAddress: "",
	fromAddress: "",
	fromUserId: "",
	type: "",
	value: "",
	timestamp: new Date().getTime(),
	blockNumber: 0
};

const MyTransactions = (): JSX.Element => {
	const dispatch = useDispatch();
	const navigation = useNavigation();
	const { customerDwollaId } = useContext(AuthContext);
	const [isFilterVisible, setIsFilterVisible] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>("");
	const [isDetailView, setIsDetailView] = useState<boolean>(false);
	const [isReturnView, setIsReturnView] = useState<boolean>(false);
	const [selectedItem, setSelectedItem] = useState<ITransaction>(defaultTransaction);
	const [isRequestSuccess, setIsRequestSuccess] = useState<boolean>(false);
	const [receivedAmount, setReceivedAmount] = useState<number>(0);
	// calendar
	const [startDate, setStartDate] = useState<Date | undefined>(undefined);
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [isStartDate, setIsStartDate] = useState<boolean>(false);
    const [isEndDate, setIsEndDate] = useState<boolean>(false);
	const [type, setType] = useState<string>('All');

	const { personalTransactions } = useSelector((state: AppState) => state.transactionReducer) as TransactionState;
	const { personalWallet } = useSelector((state: AppState) => state.walletReducer) as WalletState;

	useEffect(() => {
		if (customerDwollaId) {
			(async () => {
				dispatch(updateLoadingStatus({
					isLoading: true,
					screen: LoadingScreenTypes.LOADING_DATA
				}));
				await dispatch(loadPersonalTransactions(customerDwollaId));
				dispatch(updateLoadingStatus({
					isLoading: false,
					screen: LoadingScreenTypes.LOADING_DATA
				}));
			})();
		}
	}, []);

	const transactionList = useMemo(() => {
		
		let computedList: ITransaction[] = personalTransactions;

		// To do
		if (searchText != '') {
			computedList = computedList.filter(item => item);
		}

		const selectedType = type == customerTransactionTypes[1] ? 'IN' : 
							type == customerTransactionTypes[2] ? 'OUT' :
							type == customerTransactionTypes[3] ? 'LOADUP' : 'CASHOUT';
		if (type != customerTransactionTypes[0]) {
			computedList = computedList.filter(item => item.type === selectedType);
		}

		if (startDate) {
			computedList = computedList.filter(item => moment(item.timestamp).isBefore(startDate));
		}

		if (endDate) {
			computedList = computedList.filter(item => moment(item.timestamp).isAfter(endDate));
		}

		return computedList;
	}, [personalTransactions, type, startDate, endDate]);

	const onSearchChange = (name: string, change: string) => {
		setSearchText(change);
	}

	const viewDetail = (item: ITransaction) => {
		setSelectedItem(item);
		setIsDetailView(true);
	}

	const onReturn = () => {
		setIsDetailView(false);
		setIsReturnView(true);
	}

	const onSuccess = (amount: number) => {
		setReceivedAmount(amount);
		setIsReturnView(false);
		setIsRequestSuccess(true);
	}

	const onConfirm = () => {
		setIsRequestSuccess(false);
	}

	const onClose = () => {
		setIsDetailView(false);
		setIsReturnView(false);
		setIsRequestSuccess(false);
	}

	// calendar
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onStartDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || startDate;
        setIsStartDate(false);
        setStartDate(currentDate);
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onEndDateChange = (event: any, selectedDate?: Date) => {
        const currentDate = selectedDate || startDate;
        setIsEndDate(false);
        setEndDate(currentDate);
    };

	const onClear = () => {
		setType('All');
		setStartDate(undefined);
		setEndDate(undefined);
	}

	const onSelectType = (type: string) => {
		setType(type);
	}

	return (
		<View style={viewBase}>
			<Header
				leftComponent={<BackBtn text="Home" onClick={() => navigation.goBack()} />}
			/>
			<View style={wrappingContainerBase}>
				<View style={baseHeader}>
					<Text style={styles.headerText}>{Translation.PAYMENT.MY_TRANSACTIONS}</Text>
				</View>
				<View style={styles.totalAmountView}>
					<Text style={styles.amountText}>B$ {personalWallet.availableBalance}</Text>
				</View>
				
				<View style={styles.filterView}>
					<View style={styles.searchInput}>
						<SearchInput
							label="Search"
							name="searchText"
							keyboardType="default"
							placeholder="Search"
							value={searchText}
							onChange={onSearchChange}
						/>
					</View>
					<TouchableOpacity style={isFilterVisible ? styles.selectedFilterBtn : styles.filterBtn} onPress={()=>setIsFilterVisible(!isFilterVisible)}>
						<Octicons 
							name="settings"
							size={24}
							color={isFilterVisible ? colors.white : colors.text}
						/>
					</TouchableOpacity>
				</View>

				{isFilterVisible && <MyTransactionFilter onClear={onClear} onSelectType={onSelectType}></MyTransactionFilter>}

				<ScrollView >
					<MyTransactionList data={transactionList} onSelect={viewDetail} />
				</ScrollView>
			</View>

			<TouchableOpacity onPress={()=>navigation.navigate(Routes.QRCODE_SCAN)} style={styles.scanButton}>
				<Image
					source={require('../../../assets/images/qr_code_consumer.png')}
					containerStyle={styles.qrIcon}
				/>
				<Text style={styles.scanBtnText}>{Translation.PAYMENT.SCAN_TO_PAY_REQUEST}</Text>
			</TouchableOpacity>

			{/* pick data range */}
			{isFilterVisible && (
				<View style={styles.dataRangeView}>
					<View style={styles.dateView}>
						<Text style={styles.detailText}>{Translation.LABEL.START_DATE}</Text>
						<TouchableOpacity 
							onPress={()=>{
								setIsStartDate(true); 
								setIsEndDate(false);
							}} 
							style={styles.date}
						>
							<Text style={startDate == null ? styles.placeholder : {}}>
								{startDate == null ? "DD/MM/YY" : moment(startDate).format('DD/MM/yyyy')}
							</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.separator}></View>
					<View style={styles.dateView}>
						<Text style={styles.detailText}>{Translation.LABEL.END_DATE}</Text>
						<TouchableOpacity 
							onPress={()=>{
								setIsEndDate(true);
								setIsStartDate(false);
							}} 
							style={styles.date}
						>
							<Text style={endDate == null ? styles.placeholder : {}}>
								{endDate == null ? "DD/MM/YY" : moment(endDate).format('DD/MM/yyyy')}
							</Text>
						</TouchableOpacity>
					</View>
				</View>
			)}
			{isStartDate && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={startDate ? startDate : new Date()}
					maximumDate={endDate}
                    display={Platform.OS == "ios" ? "inline" : "default"}
                    onChange={onStartDateChange}
                />
            )}
            {isEndDate && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={endDate ? endDate : new Date()}
					minimumDate={startDate}
                    display={Platform.OS == "ios" ? "inline" : "default"}
                    onChange={onEndDateChange}
                />
            )}

			{isDetailView && <TransactionDetail visible={isDetailView} data={selectedItem} onReturn={onReturn} onClose={onClose} />}
			{isReturnView && <ReturnQRCodeGen visible={isReturnView} onSuccess={onSuccess} onClose={onClose} transactionInfo={selectedItem} /> }
			{isRequestSuccess && <PaymentRequestSuccess visible={isRequestSuccess} onClose={onConfirm} amount={receivedAmount} /> }
		</View>
	);
}

export default MyTransactions