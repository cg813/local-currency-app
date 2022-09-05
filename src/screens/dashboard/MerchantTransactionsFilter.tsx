import { AntDesign } from '@expo/vector-icons';
import React, { useRef, ReactElement } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-elements';
import SelectDropdown from 'react-native-select-dropdown';
import Translation from 'src/translation/en.json';
import { colors } from "src/theme/colors";

export const businessTransactionTypes = ["All", "Sales", "Returns", "Cash outs", "Expenses"];

const styles = StyleSheet.create({
    container: {
        paddingBottom: 10,
        paddingTop: 85
    },
    label: {
		fontSize: 10,
		lineHeight: 14,
		color: colors.bodyText
	},
    typeView: {
        height: 55,
        justifyContent: 'center',
        marginTop: 7
    },
    pickerText: {
        color: colors.purple,
        textAlign: 'left'
    },
    selectItem: {
        width: '100%',
        height: 55,
        backgroundColor: colors.white,
    },
    dropdownContainer: {marginTop: -20},
    clearFilter: {
		paddingVertical: 15,
		borderBottomWidth: 1,
		borderBottomColor: colors.purple
	},
    clearText: {
        textAlign: "center",
        color: colors.purple
    }
});

type FilterProps = {
	onClear: () => void,
	onSelectType: (type: string) => void
}

const MerchantTransactionsFilter = (props: FilterProps): ReactElement => {
    const dropdownRef = useRef({});

    const setSelectedType = (type: string) => {
        props.onSelectType(type);
    }

    const clearFilter = () => {
        dropdownRef.current.reset();
        props.onClear();
    }

	return (
		<View style={styles.container}>
            <Text style={styles.label}>{Translation.LABEL.TRANSACTION_TYPE}</Text>
            <View style={styles.typeView}>
                <SelectDropdown
                    data={businessTransactionTypes}
                    ref={dropdownRef}
                    defaultValueByIndex={0}
                    onSelect={(selectedItem) => {
                        setSelectedType(selectedItem)
                    }}
                    buttonTextAfterSelection={(selectedItem) => {
                        return selectedItem
                    }}
                    rowTextForSelection={(item) => {
                        return item
                    }}
                    buttonStyle={styles.selectItem}
                    buttonTextStyle={styles.pickerText}
                    rowStyle={styles.selectItem}
                    dropdownStyle={styles.dropdownContainer}
                    renderCustomizedRowChild={(item) => (
                        <Text style={styles.pickerText}>{item}</Text>
                    )}
                    renderDropdownIcon={() => (
                        <AntDesign name="down" size={18} color={colors.purple} />
                    )}
                />
            </View>
            <TouchableOpacity style={styles.clearFilter} onPress={clearFilter}>
                <Text style={styles.clearText}>{Translation.PAYMENT.CLEAR_FILTER}</Text>
            </TouchableOpacity>
        </View>
	);
}

export default MerchantTransactionsFilter