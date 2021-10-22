package com.junocoding.bank.controller.model

import com.junocoding.bank.repository.TransactionDBModel

class NewTransactionModel(
    val targetAccount: String,
    val value: Double,
    val description: String = "",
)

fun NewTransactionModel.convertToDBModel() = TransactionDBModel(
    accountIdentifier = this.targetAccount,
    value = this.value,
    description = this.description
)