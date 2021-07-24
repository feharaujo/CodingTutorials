package com.junocoding.bank.model

import java.util.*
import javax.persistence.Entity
import javax.persistence.GeneratedValue
import javax.persistence.Id

@Entity
class Payment(
    val targetAccountId: Int,
    val value: Double,
    val description: String = "",
    val date: Date = Date(),
    @Id @GeneratedValue val id: UUID? = null
)