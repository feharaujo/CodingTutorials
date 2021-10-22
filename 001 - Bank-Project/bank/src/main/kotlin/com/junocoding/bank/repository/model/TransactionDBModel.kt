package com.junocoding.bank.repository

import java.util.*
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id

@Entity
class TransactionDBModel(
    val accountIdentifier: String,
    val value: Double,
    val description: String = "",
) {
    @Id
    @GeneratedValue
    var id: UUID? = null
        private set

    var date: Date = Date()
        private set
}