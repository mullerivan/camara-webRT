class AddTimeToSnapshot < ActiveRecord::Migration
  def change
    add_column :snapshots, :time, :integer
  end
end
