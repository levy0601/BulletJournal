package com.bulletjournal.repository.models;

import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import javax.persistence.*;

@Entity
@Table(name = "transaction_contents")
public class TransactionContent extends ContentModel<Transaction> {
    @Id
    @GeneratedValue(generator = "transaction_content_generator")
    @SequenceGenerator(
            name = "transaction_content_generator",
            sequenceName = "transaction_content_sequence",
            initialValue = 200
    )
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "transaction_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Transaction transaction;

    @Override
    public Long getId() {
        return id;
    }

    @Override
    public Transaction getProjectItem() {
        return getTransaction();
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Transaction getTransaction() {
        return transaction;
    }

    public void setTransaction(Transaction transaction) {
        this.transaction = transaction;
    }
}